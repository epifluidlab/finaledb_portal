#!/usr/bin/env python3
"""Add new sequencing runs ("entries") to FinaleDB, or hide/unhide existing ones.

Typical use (see scripts/README.md for the full guide):

  python3 scripts/finaledb_entries.py template /path/to/new_batch
  #   ...copy the fragment files into /path/to/new_batch and fill in metadata.tsv...
  python3 scripts/finaledb_entries.py add /path/to/new_batch --dry-run
  python3 scripts/finaledb_entries.py add /path/to/new_batch

  python3 scripts/finaledb_entries.py hide EE88724      # take entries off the portal
  python3 scripts/finaledb_entries.py unhide EE88724    # show them again

What "add" does, in order (nothing is uploaded or written to the database
until every step before it has succeeded):
  1. checks metadata.tsv (and publications.tsv) and the first lines of every
     fragment file;
  2. checks the batch against the live database (duplicate runs or samples,
     unknown publications, misspelled disease/tissue/instrument/assay names)
     and picks the next free EE IDs;
  3. converts each fragment file to FinaleDB's format (5 columns: chrom, start,
     end, MAPQ, strand; FinaleDB chromosome names), names it
     EE<id>.<assembly>.frag.tsv.bgz, indexes it with tabix and writes the
     fragment-size histogram EE<id>.<assembly>.insert_size_metrics.txt;
  4. (--dry-run stops here: it runs the database changes inside a transaction
     and rolls them back, so you can check everything first);
  5. backs up the database, reserves the EE IDs by saving the entries hidden
     (one transaction), uploads the files to the public S3 bucket, then makes
     the entries visible and checks the website serves them. Because the IDs
     are reserved before anything is uploaded, two batches added at the same
     time can't overwrite each other's files. The portal reads the database
     directly, so the new entries, counts and filter values appear right away.

Requires python3 (3.8+), the aws CLI (with write access to the bucket), ssh
access to the database server, bgzip and tabix (htslib), gzip, sort and curl.
"""

import argparse
import csv
import datetime
import difflib
import gzip
import json
import os
import shlex
import shutil
import subprocess
import sys
import tempfile

SCRIPT_VERSION = 1

# Where FinaleDB lives. Each value can be overridden with an environment variable.
CFG = {
    "ssh_target": os.environ.get("FINALEDB_SSH", "ubuntu@18.190.7.192"),
    "ssh_key": os.path.expanduser(
        os.environ.get("FINALEDB_SSH_KEY", "~/.ssh/epifluidlab_aws_ohio.pem")
    ),
    "db_container": os.environ.get("FINALEDB_DB_CONTAINER", "psql_finaledb_1"),
    "db_name": os.environ.get("FINALEDB_DB_NAME", "finaledb"),
    "bucket": os.environ.get("FINALEDB_BUCKET", "finaledb.epifluidlab.cchmc.org"),
    "bucket_region": os.environ.get("FINALEDB_BUCKET_REGION", "us-east-2"),
    "backup_prefix": os.environ.get(
        "FINALEDB_BACKUP_PREFIX", "s3://epifluidlab-storage-backup/finaledb_db_dumps/"
    ),
    "site": os.environ.get(
        "FINALEDB_SITE", "https://finaledb.research.cchmc.org"
    ).rstrip("/"),
}

ASSEMBLIES = ("hg19", "hg38")
STAGING_NAME = "finaledb_upload"

# metadata.tsv: one row per sequencing run (= one FinaleDB entry).
# (column, required, description, example)
RUN_COLUMNS = [
    ("run_id", True, "Your ID for the sequencing run (stored as the entry's original ID)", "LAB0001"),
    ("frag_hg19", False, "Fragment file aligned to hg19/GRCh37 (file name in this folder)", "LAB0001.hg19.frag.bed.gz"),
    ("frag_hg38", False, "Fragment file aligned to hg38 (give frag_hg19, frag_hg38 or both)", "LAB0001.hg38.frag.bed.gz"),
    ("sample_name", True, "Biological sample name; must not exist in FinaleDB yet", "LAB_P001"),
    ("disease", True, "Disease status, e.g. Healthy, Breast cancer, Prostate cancer", "Healthy"),
    ("subtype", False, "Disease subtype, e.g. MBC, CRPC, HCC", ""),
    ("tissue", True, "e.g. blood plasma, urine", "blood plasma"),
    ("gender", False, "male, female or mixed", "female"),
    ("age", False, "Age in years", "54"),
    ("assay", False, "WGS (default) or WXS", "WGS"),
    ("instrument", True, "Sequencer, e.g. NovaSeq 6000, HiSeq X Ten", "NovaSeq 6000"),
    ("read_length", True, "Read length in bp", "150"),
    ("seq_layout", False, "PAIRED (default) or SINGLE", "PAIRED"),
    ("publication", False, "Label of a FinaleDB publication (e.g. snyder2016cell) or of a new one in publications.tsv; leave empty for unpublished data", ""),
    ("sra_id", False, "SRA run accession (SRR...)", ""),
    ("geo_id", False, "GEO sample accession (GSM...)", ""),
    ("mbases", False, "Sequenced megabases", ""),
    ("num_reads", False, "Number of reads", ""),
    ("comment", False, "Free text; defaults to the publication label, or 'in-house'", ""),
]

# publications.tsv (optional): new publications referenced from metadata.tsv.
PUB_COLUMNS = [
    ("label", True, "Short unique label used in metadata.tsv", "smith2026natcomm"),
    ("title", True, "Article title", "Cell-free DNA fragmentation in ..."),
    ("journal", True, "Journal", "Nature Communications"),
    ("first_author", True, "First author", "Jane Smith"),
    ("date", True, "Publication date, YYYY-MM-DD", "2026-01-15"),
    ("pmid", False, "PubMed ID", ""),
    ("doi", False, "DOI", "10.1038/s41467-026-00000-0"),
    ("link", False, "Article URL (defaults to https://doi.org/<doi> or the PubMed page)", ""),
    ("cite_short", False, "Short citation shown on the portal (defaults to '<last name> et al., <year>')", ""),
]

CANONICAL_CHROMS = {str(i) for i in range(1, 23)} | {"X", "Y"}


class UserError(Exception):
    """A problem the user has to fix (bad metadata, missing file, ...)."""


class DBError(Exception):
    pass


def log(msg=""):
    print(f"[{datetime.datetime.now().strftime('%H:%M:%S')}] {msg}" if msg else "", flush=True)


def run(cmd, **kw):
    """subprocess.run with captured text output; raises on failure."""
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, **kw)
    if p.returncode != 0:
        err = p.stderr.decode("utf-8", "replace").strip()
        raise RuntimeError(f"command failed ({p.returncode}): {' '.join(cmd[:4])} ...\n{err}")
    return p.stdout.decode("utf-8", "replace")


def require_tools(tools):
    missing = [t for t in tools if shutil.which(t) is None]
    if missing:
        raise UserError(
            "missing command(s): " + ", ".join(missing) + "\n"
            "  bgzip/tabix: `brew install htslib` or `conda install -c bioconda htslib`\n"
            "  aws: `brew install awscli` or `pip install awscli`"
        )


# --------------------------------------------------------------------------
# SQL helpers. Values are quoted here; the database runs with
# standard_conforming_strings=on (set explicitly at the top of each script).
# --------------------------------------------------------------------------
def q(v):
    if v is None:
        return "NULL"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, int):
        return str(v)
    s = str(v)
    if "\x00" in s or "$finaledb$" in s:
        raise UserError(f"value not allowed in metadata: {s!r}")
    return "'" + s.replace("'", "''") + "'"


def qjson(obj, typ="json"):
    if obj is None:
        return "NULL"
    return q(json.dumps(obj, ensure_ascii=False)) + "::" + typ


def qarray(values, typ):
    return "ARRAY[" + ",".join(q(v) for v in values) + "]::" + typ + "[]"


def ssh_cmd(remote):
    return [
        "ssh", "-i", CFG["ssh_key"],
        "-o", "BatchMode=yes", "-o", "ConnectTimeout=20",
        "-o", "StrictHostKeyChecking=accept-new",
        CFG["ssh_target"], remote,
    ]


def psql(sql):
    """Run SQL (sent on stdin) with psql inside the database container."""
    remote = "sudo docker exec -i {} psql -X -q -A -t -v ON_ERROR_STOP=1 -U postgres -d {}".format(
        shlex.quote(CFG["db_container"]), shlex.quote(CFG["db_name"])
    )
    p = subprocess.run(
        ssh_cmd(remote), input=sql.encode("utf-8"),
        stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    )
    if p.returncode != 0:
        msg = p.stderr.decode("utf-8", "replace").strip()
        raise DBError(msg or f"psql/ssh exited with code {p.returncode}")
    return p.stdout.decode("utf-8")


def psql_json(sql):
    lines = [ln for ln in psql(sql).splitlines() if ln.strip()]
    if not lines:
        raise DBError("database returned no result")
    return json.loads(lines[-1])


# --------------------------------------------------------------------------
# Reading metadata.tsv / publications.tsv
# --------------------------------------------------------------------------
def read_table(path):
    """Return (header, [(line_number, {column: value})]). Lines starting
    with '#' and empty lines are ignored. .csv files are comma-separated,
    everything else tab-separated."""
    delim = "," if path.lower().endswith(".csv") else "\t"
    header, rows = None, []
    with open(path, newline="", encoding="utf-8-sig") as fh:
        for lineno, rec in enumerate(csv.reader(fh, delimiter=delim), start=1):
            cells = [c.strip() for c in rec]
            if not any(cells) or cells[0].startswith("#"):
                continue
            if header is None:
                header = [c.lower() for c in cells]
                continue
            if len(cells) > len(header) and any(cells[len(header):]):
                raise UserError(f"{os.path.basename(path)} line {lineno}: more cells than header columns")
            cells += [""] * (len(header) - len(cells))
            rows.append((lineno, dict(zip(header, cells))))
    if header is None:
        raise UserError(f"{path} has no header line")
    return header, rows


def check_columns(path, header, spec, errors):
    known = [c[0] for c in spec]
    unknown = [h for h in header if h not in known]
    if unknown:
        errors.append(f"{os.path.basename(path)}: unknown column(s) {', '.join(unknown)}; allowed: {', '.join(known)}")
    missing = [c[0] for c in spec if c[1] and c[0] not in header]
    if missing:
        errors.append(f"{os.path.basename(path)}: missing required column(s) {', '.join(missing)}")


def parse_int(value, field, where, errors, lo=0, hi=None):
    if value == "":
        return None
    try:
        v = int(float(value)) if "." in value and float(value).is_integer() else int(value)
    except ValueError:
        errors.append(f"{where}: {field} must be a whole number, got '{value}'")
        return None
    if v < lo or (hi is not None and v > hi):
        errors.append(f"{where}: {field} {v} is out of range")
        return None
    return v


def parse_runs(meta_path, batch_dir):
    header, rows = read_table(meta_path)
    errors = []
    check_columns(meta_path, header, RUN_COLUMNS, errors)
    if errors:
        return [], errors
    runs, used_files = [], {}
    for lineno, r in rows:
        where = f"{os.path.basename(meta_path)} line {lineno}"
        g = lambda k: r.get(k, "").strip()  # noqa: E731
        for col, required, _, _ in RUN_COLUMNS:
            if required and not g(col):
                errors.append(f"{where}: '{col}' is empty")
        files = {}
        for asm in ASSEMBLIES:
            name = g(f"frag_{asm}")
            if not name:
                continue
            path = os.path.abspath(name if os.path.isabs(name) else os.path.join(batch_dir, name))
            if not os.path.isfile(path):
                errors.append(f"{where}: frag_{asm} file not found: {name}")
                continue
            if path in used_files:
                errors.append(f"{where}: {name} is already used on line {used_files[path]}")
            used_files[path] = lineno
            files[asm] = path
        if not g("frag_hg19") and not g("frag_hg38"):
            errors.append(f"{where}: give a fragment file in frag_hg19 and/or frag_hg38")
        gender = g("gender").lower()
        if gender not in ("", "male", "female", "mixed"):
            errors.append(f"{where}: gender must be male, female or mixed (or empty), got '{g('gender')}'")
        layout = (g("seq_layout") or "PAIRED").upper()
        if layout not in ("PAIRED", "SINGLE"):
            errors.append(f"{where}: seq_layout must be PAIRED or SINGLE, got '{g('seq_layout')}'")
        runs.append({
            "where": where,
            "run_id": g("run_id"),
            "sra_id": g("sra_id") or None,
            "files": files,
            "sample": {
                "name": g("sample_name"),
                "disease": g("disease"),
                "subtype": g("subtype") or None,
                "tissue": g("tissue"),
                "gender": gender or None,
                "age": parse_int(g("age"), "age", where, errors, 0, 130),
                "geo_id": g("geo_id") or None,
            },
            "assay": g("assay") or "WGS",
            "instrument": g("instrument"),
            "read_length": parse_int(g("read_length"), "read_length", where, errors, 10, 100000),
            "seq_layout": layout,
            "publication": g("publication") or None,
            "mbases": parse_int(g("mbases"), "mbases", where, errors, 0, 2**31 - 1),
            "num_reads": parse_int(g("num_reads"), "num_reads", where, errors, 0),
            "comment": g("comment") or None,
        })
    if not runs and not errors:
        errors.append(f"{os.path.basename(meta_path)} has no data rows")

    # Within-batch consistency
    seen_run, seen_sra, samples = {}, {}, {}
    for run in runs:
        if run["run_id"]:
            if run["run_id"] in seen_run:
                errors.append(f"{run['where']}: run_id {run['run_id']} also on {seen_run[run['run_id']]}")
            seen_run.setdefault(run["run_id"], run["where"])
        if run["sra_id"]:
            if run["sra_id"] in seen_sra:
                errors.append(f"{run['where']}: sra_id {run['sra_id']} also on {seen_sra[run['sra_id']]}")
            seen_sra.setdefault(run["sra_id"], run["where"])
        s = run["sample"]
        if s["name"] in samples and samples[s["name"]][1] != s:
            errors.append(
                f"{run['where']}: sample {s['name']} is also on {samples[s['name']][0]} "
                "with different sample details (disease, subtype, tissue, gender, age, geo_id must match)"
            )
        samples.setdefault(s["name"], (run["where"], s))
    return runs, errors


def parse_publications(pub_path):
    if not pub_path:
        return [], []
    header, rows = read_table(pub_path)
    errors = []
    check_columns(pub_path, header, PUB_COLUMNS, errors)
    if errors:
        return [], errors
    pubs = []
    for lineno, r in rows:
        where = f"{os.path.basename(pub_path)} line {lineno}"
        g = lambda k: r.get(k, "").strip()  # noqa: E731
        for col, required, _, _ in PUB_COLUMNS:
            if required and not g(col):
                errors.append(f"{where}: '{col}' is empty")
        try:
            date = datetime.date.fromisoformat(g("date")) if g("date") else None
        except ValueError:
            errors.append(f"{where}: date must be YYYY-MM-DD, got '{g('date')}'")
            date = None
        author = g("first_author")
        identifiers = {}
        if g("pmid"):
            identifiers["pmid"] = g("pmid")
        if g("doi"):
            identifiers["doi"] = g("doi")
        link = g("link") or (
            f"https://doi.org/{g('doi')}" if g("doi")
            else f"https://pubmed.ncbi.nlm.nih.gov/{g('pmid')}/" if g("pmid") else None
        )
        cite = g("cite_short") or (
            f"{author.split()[-1]} et al., {date.year}" if author and date else None
        )
        pubs.append({
            "where": where, "label": g("label"), "title": g("title"),
            "journal": g("journal"), "author": [author] if author else None,
            "date": date.isoformat() if date else None, "link": link,
            "identifiers": identifiers or None, "cite_short": cite,
        })
    labels = [p["label"] for p in pubs]
    for lab in {x for x in labels if labels.count(x) > 1}:
        errors.append(f"{os.path.basename(pub_path)}: label {lab} appears more than once")
    return pubs, errors


def find_file(batch_dir, explicit, stem):
    if explicit:
        path = explicit if os.path.isabs(explicit) else os.path.join(batch_dir, explicit)
        if not os.path.isfile(path):
            raise UserError(f"file not found: {explicit}")
        return os.path.abspath(path)
    for ext in (".tsv", ".txt", ".csv"):
        path = os.path.join(batch_dir, stem + ext)
        if os.path.isfile(path):
            return path
    return None


# --------------------------------------------------------------------------
# Fragment files
# --------------------------------------------------------------------------
def chrom_normalizer(assembly):
    """FinaleDB names hg19 chromosomes the GRCh37 way (1..22, X, Y, MT) and
    hg38 chromosomes the UCSC way (chr1..chr22, chrX, chrY, chrM). Canonical
    chromosomes given in the other style are renamed; other contigs are kept
    as they are."""
    cache, renamed = {}, {}

    def norm(name):
        out = cache.get(name)
        if out is not None:
            return out
        s = name.decode("utf-8", "replace")
        new = s
        if assembly == "hg19" and s.startswith("chr"):
            core = s[3:]
            new = core if core in CANONICAL_CHROMS else ("MT" if core in ("M", "MT") else s)
        elif assembly == "hg38":
            new = "chr" + s if s in CANONICAL_CHROMS else ("chrM" if s in ("M", "MT") else s)
        if new != s:
            renamed[s] = new
        out = new.encode()
        cache[name] = out
        return out

    return norm, renamed


def is_gzip(path):
    with open(path, "rb") as fh:
        return fh.read(2) == b"\x1f\x8b"


def scan_fragments(path, assembly, sink=None, limit=None, stop_on_unsorted=False):
    """Read a fragment file, validate and normalise every line, optionally
    write FinaleDB-format lines to `sink`. Accepts FinaleDB's 5-column format
    (chrom, start, end, MAPQ, strand) or BED6 (chrom, start, end, name, MAPQ,
    strand), plain or gzip/bgzip compressed."""
    name = os.path.basename(path)
    norm, renamed = chrom_normalizer(assembly)
    proc = None
    if is_gzip(path):
        proc = subprocess.Popen(["gzip", "-dc", path], stdout=subprocess.PIPE, bufsize=1 << 20)
        stream = proc.stdout
    else:
        stream = open(path, "rb", buffering=1 << 20)
    n = lineno = 0
    ncol = mq_i = st_i = None
    small, large = [0] * 2001, {}
    cur, seen, contigs, last = None, set(), [], -1
    unsorted = stopped = False
    buf = []

    def bad(msg):
        raise UserError(f"{name} line {lineno}: {msg}")

    try:
        for raw in stream:
            lineno += 1
            line = raw.rstrip(b"\r\n")
            if not line or line[:1] == b"#" or line.startswith((b"track", b"browser")):
                continue
            f = line.split(b"\t")
            if ncol is None:
                if len(f) == 5:
                    ncol, mq_i, st_i = 5, 3, 4
                elif len(f) == 6:
                    ncol, mq_i, st_i = 6, 4, 5
                else:
                    bad(f"expected 5 tab-separated columns (chrom, start, end, MAPQ, strand) "
                        f"or 6 BED columns (chrom, start, end, name, MAPQ, strand); found {len(f)}")
            elif len(f) != ncol:
                bad(f"expected {ncol} columns, found {len(f)}")
            chrom, s_b, e_b, mq, strand = f[0], f[1], f[2], f[mq_i], f[st_i]
            if not chrom:
                bad("empty chromosome name")
            if not (s_b.isdigit() and e_b.isdigit()):
                bad(f"start/end must be whole numbers, got '{s_b.decode(errors='replace')}' "
                    f"'{e_b.decode(errors='replace')}'")
            s, e = int(s_b), int(e_b)
            if e <= s:
                bad(f"end ({e}) must be greater than start ({s})")
            if not mq.isdigit():
                bad(f"MAPQ must be a whole number, got '{mq.decode(errors='replace')}'")
            if strand != b"+" and strand != b"-":
                bad(f"strand must be + or -, got '{strand.decode(errors='replace')}'")
            c = norm(chrom)
            if c != cur:
                if c in seen:
                    unsorted = True
                else:
                    seen.add(c)
                    contigs.append(c)
                cur, last = c, -1
            if s < last:
                unsorted = True
            last = s
            if unsorted and stop_on_unsorted:
                stopped = True
                break
            size = e - s
            if size <= 2000:
                small[size] += 1
            else:
                large[size] = large.get(size, 0) + 1
            n += 1
            if sink is not None:
                buf.append(b"\t".join((c, s_b, e_b, mq, strand)) + b"\n")
                if len(buf) >= 200000:
                    sink.write(b"".join(buf))
                    buf.clear()
            if limit and n >= limit:
                stopped = True
                break
        if sink is not None and buf:
            sink.write(b"".join(buf))
    finally:
        stream.close()
        if proc is not None:
            if stopped:
                proc.kill()
            rc = proc.wait()
            if not stopped and rc != 0:
                raise UserError(f"{name}: could not decompress (gzip exit code {rc})")
    if n == 0 and not unsorted:
        raise UserError(f"{name}: no fragments found")
    hist = {i: c for i, c in enumerate(small) if c}
    hist.update(large)
    return {
        "n": n, "ncol": ncol, "unsorted": unsorted, "hist": hist,
        "contigs": [c.decode() for c in contigs], "renamed": renamed,
    }


def build_fragment_file(src, assembly, out_bgz, threads, tmpdir):
    """Write src as a FinaleDB fragment file (bgzip + tabix -p bed)."""
    partial = out_bgz + ".partial"
    bgzip_cmd = ["bgzip", "-@", str(threads), "-c"]
    # Pass 1: assume the input is sorted and stream it straight into bgzip.
    with open(partial, "wb") as fo:
        bg = subprocess.Popen(bgzip_cmd, stdin=subprocess.PIPE, stdout=fo)
        try:
            res = scan_fragments(src, assembly, sink=bg.stdin, stop_on_unsorted=True)
        finally:
            bg.stdin.close()
            rc = bg.wait()
    if rc != 0:
        raise RuntimeError(f"bgzip failed on {src}")
    res["resorted"] = False
    if res["unsorted"]:
        # Pass 2: sort the same way as existing FinaleDB files.
        log("    input is not sorted by position; sorting it (slower)")
        with open(partial, "wb") as fo:
            srt = subprocess.Popen(
                ["sort", "-t", "\t", "-k1,1", "-k2,2n", "-k3,3n", "-S", "1G", "-T", tmpdir],
                stdin=subprocess.PIPE, stdout=subprocess.PIPE, env=dict(os.environ, LC_ALL="C"),
            )
            bg = subprocess.Popen(bgzip_cmd, stdin=srt.stdout, stdout=fo)
            srt.stdout.close()
            try:
                res = scan_fragments(src, assembly, sink=srt.stdin)
            finally:
                srt.stdin.close()
                rc1, rc2 = srt.wait(), bg.wait()
        if rc1 != 0 or rc2 != 0:
            raise RuntimeError(f"sort/bgzip failed on {src}")
        res["resorted"] = True
    os.replace(partial, out_bgz)
    run(["tabix", "-f", "-p", "bed", out_bgz])
    return res


def weighted_median(hist):
    total = sum(hist.values())
    half, acc = (total + 1) // 2, 0
    for k in sorted(hist):
        acc += hist[k]
        if acc >= half:
            return k
    return 0


def write_insert_size_metrics(hist, path, source_name):
    """Fragment-size histogram in Picard CollectInsertSizeMetrics layout,
    which is what the portal's fragment-size chart reads (it skips exactly 11
    header lines). Like Picard, the histogram stops at median + 10 x MAD."""
    total = sum(hist.values())
    median = weighted_median(hist)
    dev = {}
    for size, cnt in hist.items():
        d = abs(size - median)
        dev[d] = dev.get(d, 0) + cnt
    mad = weighted_median(dev)
    cutoff = median + 10 * mad
    kept = [s for s in sorted(hist) if s <= cutoff]
    kn = sum(hist[s] for s in kept)
    mean = sum(s * hist[s] for s in kept) / kn
    sd = (sum(hist[s] * (s - mean) ** 2 for s in kept) / (kn - 1)) ** 0.5 if kn > 1 else 0.0
    mode = max(kept, key=lambda s: hist[s])
    header = [
        "## htsjdk.samtools.metrics.StringHeader",
        f"# FinaleDB fragment-size histogram computed by scripts/finaledb_entries.py from {source_name}",
        "## htsjdk.samtools.metrics.StringHeader",
        f"# Started on: {datetime.datetime.now().strftime('%a %b %d %H:%M:%S %Y')}",
        "",
        "## METRICS CLASS\tpicard.analysis.InsertSizeMetrics",
        "MEDIAN_INSERT_SIZE\tMODE_INSERT_SIZE\tMEDIAN_ABSOLUTE_DEVIATION\tMIN_INSERT_SIZE\t"
        "MAX_INSERT_SIZE\tMEAN_INSERT_SIZE\tSTANDARD_DEVIATION\tREAD_PAIRS\tPAIR_ORIENTATION",
        f"{median}\t{mode}\t{mad}\t{min(hist)}\t{max(hist)}\t{mean:.6f}\t{sd:.6f}\t{total}\tFR",
        "",
        "## HISTOGRAM\tjava.lang.Integer",
        "insert_size\tAll_Reads.fr_count",
    ]
    assert len(header) == 11  # the portal skips exactly 11 lines
    with open(path, "w") as fh:
        fh.write("\n".join(header + [f"{s}\t{hist[s]}" for s in kept]) + "\n\n")
    return {"median": median, "mode": mode, "mad": mad}


def stage_files(run_, asm, staging, threads, tmpdir):
    """Create the renamed FinaleDB files for one run/assembly in the staging
    folder (reusing them if a previous run of this script made them from the
    same input for the same entry ID). Returns (stats, [(local, s3_key)])."""
    eid = run_["entry_id"]
    rel = f"entries/EE{eid}/{asm}"
    folder = os.path.join(staging, rel)
    os.makedirs(folder, exist_ok=True)
    base = f"EE{eid}.{asm}"
    bgz = os.path.join(folder, base + ".frag.tsv.bgz")
    tbi = bgz + ".tbi"
    ism = os.path.join(folder, base + ".insert_size_metrics.txt")
    side = os.path.join(folder, base + ".finaledb_stats.json")
    uploads = [(p, f"{rel}/{os.path.basename(p)}") for p in (bgz, tbi, ism)]
    src = run_["files"][asm]
    st = os.stat(src)
    ident = {
        "version": SCRIPT_VERSION, "source": src, "source_size": st.st_size,
        "source_mtime": int(st.st_mtime), "assembly": asm, "entry_id": eid,
    }
    if all(os.path.exists(p) for p in (bgz, tbi, ism, side)):
        try:
            with open(side) as fh:
                prev = json.load(fh)
            if {k: prev.get(k) for k in ident} == ident:
                log(f"  {base}: reusing files made earlier from {os.path.basename(src)}")
                return prev["stats"], uploads
        except (OSError, ValueError, KeyError):
            pass
    log(f"  {base}: converting {os.path.basename(src)}")
    res = build_fragment_file(src, asm, bgz, threads, tmpdir)
    metrics = write_insert_size_metrics(res["hist"], ism, os.path.basename(src))
    stats = {
        "n_fragments": res["n"],
        "input_columns": res["ncol"],
        "resorted": res["resorted"],
        "renamed_chroms": res["renamed"],
        "n_contigs": len(res["contigs"]),
        "median_size": metrics["median"],
        "mode_size": metrics["mode"],
    }
    with open(side, "w") as fh:
        json.dump(dict(ident, stats=stats), fh, indent=1)
    renamed = ", ".join(f"{a}->{b}" for a, b in list(res["renamed"].items())[:4])
    log(f"    {res['n']:,} fragments on {len(res['contigs'])} contigs, median size {metrics['median']} bp"
        + (f"; renamed {renamed}{' ...' if len(res['renamed']) > 4 else ''}" if renamed else ""))
    return stats, uploads


# --------------------------------------------------------------------------
# Checks against the live database
# --------------------------------------------------------------------------
def db_snapshot(runs):
    names = sorted({r["sample"]["name"] for r in runs})
    run_ids = sorted({r["run_id"] for r in runs})
    sra_ids = sorted({r["sra_id"] for r in runs if r["sra_id"]})
    sql = f"""
SET standard_conforming_strings = on;
SELECT json_build_object(
 'max_seqrun', (SELECT max(id) FROM dev.seqrun),
 'max_sample', (SELECT max(id) FROM dev.sample),
 'max_publication', (SELECT max(id) FROM dev.publication),
 'samples', (SELECT coalesce(json_agg(json_build_object('id', id, 'name', name, 'disease', disease, 'tissue', tissue)), '[]'::json)
             FROM dev.sample WHERE name = ANY({qarray(names, 'text')})),
 'runs', (SELECT coalesce(json_agg(json_build_object('id', id, 'original', alt_id->>'original', 'sra', alt_id->>'SRA', 'hidden', hidden)), '[]'::json)
          FROM dev.seqrun WHERE alt_id->>'original' = ANY({qarray(run_ids, 'text')})
                             OR alt_id->>'SRA' = ANY({qarray(sra_ids, 'text')})),
 'publications', (SELECT coalesce(json_agg(json_build_object('id', id, 'label', label, 'cite_short', cite_short) ORDER BY id), '[]'::json)
                  FROM dev.publication),
 'diseases', (SELECT coalesce(json_agg(DISTINCT disease), '[]'::json) FROM dev.sample WHERE coalesce(disease, '') <> ''),
 'tissues', (SELECT coalesce(json_agg(DISTINCT tissue), '[]'::json) FROM dev.sample WHERE coalesce(tissue, '') <> ''),
 'instruments', (SELECT coalesce(json_agg(DISTINCT seq_config->>'instrument'), '[]'::json) FROM dev.seqrun
                 WHERE coalesce(seq_config->>'instrument', '') <> ''),
 'assays', (SELECT coalesce(json_agg(DISTINCT assay), '[]'::json) FROM dev.seqrun WHERE coalesce(assay, '') <> '')
)::jsonb;
"""
    return psql_json(sql)


def check_vocabulary(runs, label, existing, get, set_, allow_new, errors, notes):
    """Use FinaleDB's existing spelling when a value matches ignoring case;
    flag values FinaleDB has never seen (often typos)."""
    by_lower = {v.lower(): v for v in existing}
    new = {}
    for r in runs:
        v = get(r)
        if not v:
            continue
        canon = by_lower.get(" ".join(v.split()).lower())
        if canon is None:
            new.setdefault(v, []).append(r["run_id"])
        elif canon != v:
            notes.append(f"{label} '{v}' written as '{canon}' (FinaleDB's existing spelling)")
            set_(r, canon)
    for v, rids in sorted(new.items()):
        close = difflib.get_close_matches(v, existing, n=3, cutoff=0.6)
        msg = (f"{label} '{v}' is new to FinaleDB (runs {', '.join(rids[:3])}{' ...' if len(rids) > 3 else ''})"
               + (f"; similar existing values: {', '.join(close)}" if close else ""))
        if allow_new:
            notes.append(msg)
        else:
            errors.append(msg + ". If it is intended, re-run with --allow-new-values")


def resolve_against_db(runs, new_pubs, snap, args):
    errors, notes = [], []
    for r in snap["runs"]:
        clash = r["original"] if r["original"] in {x["run_id"] for x in runs} else r["sra"]
        errors.append(f"run {clash} is already in FinaleDB as EE{r['id']}"
                      + (" (hidden; it may be left over from an interrupted run)" if r.get("hidden") else ""))
    existing_samples = {s["name"]: s for s in snap["samples"]}
    for name, s in existing_samples.items():
        if args.allow_existing_samples:
            notes.append(f"sample {name} already exists (id {s['id']}, {s['disease']}, {s['tissue']}); "
                         "new runs are linked to it and its details are kept")
        else:
            errors.append(f"sample {name} already exists in FinaleDB (id {s['id']}, {s['disease']}). "
                          "Use a different sample_name, or --allow-existing-samples to add runs to that sample")

    db_pubs = snap["publications"]
    by_label = {p["label"].lower(): p for p in db_pubs if p["label"]}
    by_id = {str(p["id"]): p for p in db_pubs}
    new_by_label = {p["label"].lower(): p for p in new_pubs}
    for p in new_pubs:
        if p["label"].lower() in by_label:
            errors.append(f"{p['where']}: publication {p['label']} already exists in FinaleDB "
                          f"(id {by_label[p['label'].lower()]['id']}); remove it from publications.tsv")
    used_new = set()
    for r in runs:
        ref = r["publication"]
        r["pub"] = None
        if not ref:
            continue
        key = ref.lower()
        if key in new_by_label and key not in by_label:
            r["pub"] = new_by_label[key]
            used_new.add(key)
        elif key in by_label:
            r["pub"] = by_label[key]
        elif ref in by_id:
            r["pub"] = by_id[ref]
        else:
            errors.append(f"{r['where']}: publication '{ref}' is not in FinaleDB; add it to publications.tsv "
                          f"(existing labels: {', '.join(p['label'] for p in db_pubs if p['label'])})")
    for key, p in new_by_label.items():
        if key not in used_new and key not in by_label:
            notes.append(f"publication {p['label']} in publications.tsv is not used by any run; skipped")

    new_samples = [r for r in runs if r["sample"]["name"] not in existing_samples]
    check_vocabulary(new_samples, "disease", snap["diseases"], lambda r: r["sample"]["disease"],
                     lambda r, v: r["sample"].__setitem__("disease", v), args.allow_new_values, errors, notes)
    check_vocabulary(new_samples, "tissue", snap["tissues"], lambda r: r["sample"]["tissue"],
                     lambda r, v: r["sample"].__setitem__("tissue", v), args.allow_new_values, errors, notes)
    check_vocabulary(runs, "instrument", snap["instruments"], lambda r: r["instrument"],
                     lambda r, v: r.__setitem__("instrument", v), args.allow_new_values, errors, notes)
    check_vocabulary(runs, "assay", snap["assays"], lambda r: r["assay"],
                     lambda r, v: r.__setitem__("assay", v), args.allow_new_values, errors, notes)

    # Reserve IDs: entries, then new samples, then new publications.
    next_entry = snap["max_seqrun"] + 1
    for r in runs:
        r["entry_id"] = next_entry
        next_entry += 1
    samples, next_sample = {}, snap["max_sample"] + 1
    for r in runs:
        name = r["sample"]["name"]
        if name in existing_samples:
            r["sample_id"], r["sample_is_new"] = existing_samples[name]["id"], False
            continue
        if name not in samples:
            samples[name] = dict(r["sample"], id=next_sample)
            next_sample += 1
        r["sample_id"], r["sample_is_new"] = samples[name]["id"], True
    pubs_to_add, next_pub = [], snap["max_publication"] + 1
    for p in new_pubs:
        if p["label"].lower() in used_new:
            p["id"] = next_pub
            next_pub += 1
            pubs_to_add.append(p)
    return errors, notes, list(samples.values()), pubs_to_add


# --------------------------------------------------------------------------
# Database changes
# --------------------------------------------------------------------------
def txn(statements, commit):
    """Wrap SQL statements in one transaction, committed or rolled back."""
    return "\n".join(
        ["SET standard_conforming_strings = on;", "BEGIN;"] + statements + ["COMMIT;" if commit else "ROLLBACK;"]
    ) + "\n"


def reserve_statements(runs, samples, pubs, stats, update_sequences):
    """Insert the batch with every entry hidden. A real run commits this
    before uploading anything, which reserves the EE IDs: another batch that
    picked the same IDs at the same time fails here, before it uploads, so
    it can never overwrite this batch's files. The entries are made visible
    once all their files are uploaded."""
    entry_ids = [r["entry_id"] for r in runs]
    sample_ids = [s["id"] for s in samples]
    pub_ids = [p["id"] for p in pubs]
    out = [
        "LOCK TABLE dev.publication, dev.sample, dev.seqrun IN SHARE ROW EXCLUSIVE MODE;",
        f"""DO $finaledb$
BEGIN
  IF EXISTS (SELECT 1 FROM dev.seqrun WHERE id = ANY({qarray(entry_ids, 'int')})) THEN
    RAISE EXCEPTION 'The EE IDs reserved for this batch were taken meanwhile. Run the script again.';
  END IF;
  IF EXISTS (SELECT 1 FROM dev.seqrun WHERE alt_id->>'original' = ANY({qarray([r['run_id'] for r in runs], 'text')})) THEN
    RAISE EXCEPTION 'Some run IDs of this batch are already in FinaleDB.';
  END IF;
  IF EXISTS (SELECT 1 FROM dev.sample WHERE id = ANY({qarray(sample_ids, 'int')})
             OR name = ANY({qarray([s['name'] for s in samples], 'text')})) THEN
    RAISE EXCEPTION 'The sample IDs or names of this batch were taken meanwhile. Run the script again.';
  END IF;
  IF EXISTS (SELECT 1 FROM dev.publication WHERE id = ANY({qarray(pub_ids, 'int')})
             OR label = ANY({qarray([p['label'] for p in pubs], 'text')})) THEN
    RAISE EXCEPTION 'The publication IDs or labels of this batch were taken meanwhile. Run the script again.';
  END IF;
END
$finaledb$;""",
    ]
    for p in pubs:
        out.append(
            "INSERT INTO dev.publication (id, title, journal, author, date, labs, link, identifiers, label, cite_short) "
            f"VALUES ({q(p['id'])}, {q(p['title'])}, {q(p['journal'])}, {qjson(p['author'])}, "
            f"{q(p['date'])}::date, NULL, {q(p['link'])}, {qjson(p['identifiers'])}, {q(p['label'])}, {q(p['cite_short'])});"
        )
    for s in samples:
        pathological = [s["subtype"] or s["disease"]]
        alt = {"GEO": s["geo_id"]} if s["geo_id"] else None
        out.append(
            "INSERT INTO dev.sample (id, pathological, age, gender, tissue, name, disease, subtype, alt_id) "
            f"VALUES ({q(s['id'])}, {qjson(pathological)}, {q(s['age'])}, {q(s['gender'])}, {q(s['tissue'])}, "
            f"{q(s['name'])}, {q(s['disease'])}, {q(s['subtype'])}, {qjson(alt, 'jsonb')});"
        )
    for r in runs:
        eid = r["entry_id"]
        alt = {"original": r["run_id"]}
        if r["sra_id"]:
            alt["SRA"] = r["sra_id"]
        analysis, frag_num = [], {}
        for asm in ASSEMBLIES:
            if asm not in r["files"]:
                continue
            base = f"entries/EE{eid}/{asm}/EE{eid}.{asm}"
            analysis.append({"desc": "fragment", "key": f"{base}.frag.tsv.bgz", "assembly": asm, "type": "tsv"})
            analysis.append({"desc": "fragment size", "key": f"{base}.insert_size_metrics.txt", "assembly": asm, "type": "txt"})
            frag_num[asm] = stats[(eid, asm)]["n_fragments"]
        seq_config = {"readlen": r["read_length"], "instrument": r["instrument"], "seq_layout": r["seq_layout"]}
        comment = r["comment"] or (r["pub"]["label"] if r["pub"] else "in-house")
        out.append(
            "INSERT INTO dev.seqrun (id, alt_id, publication_id, sample_id, mbases, num_reads, assay, analysis, "
            "comment, seq_config, hidden, resgroup_id, frag_num) "
            f"VALUES ({q(eid)}, {qjson(alt)}, {q(r['pub']['id'] if r['pub'] else None)}, {q(r['sample_id'])}, "
            f"{q(r['mbases'])}, {q(r['num_reads'])}, {q(r['assay'])}, {qjson(analysis)}, {q(comment)}, "
            f"{qjson(seq_config)}, {q(True)}, NULL, {qjson(frag_num, 'jsonb')});"
        )
    if update_sequences:
        # This script picks IDs itself; keep the ID sequences in step so other
        # tools that rely on the column defaults don't hit existing IDs.
        # (Not done in a dry run: sequence changes are never rolled back.)
        out.append("""DO $finaledb$
BEGIN
  PERFORM setval('dev.seqrun__id_seq', (SELECT max(id) FROM dev.seqrun));
  PERFORM setval('dev.publication__id_seq', (SELECT max(id) FROM dev.publication));
END
$finaledb$;""")
    out.append(
        "SELECT json_build_object("
        f"'entries', (SELECT coalesce(json_agg(id ORDER BY id), '[]'::json) FROM dev.seqrun WHERE id = ANY({qarray(entry_ids, 'int')})), "
        f"'samples', (SELECT count(*) FROM dev.sample WHERE id = ANY({qarray(sample_ids, 'int')})), "
        f"'publications', (SELECT count(*) FROM dev.publication WHERE id = ANY({qarray(pub_ids, 'int')})))::jsonb;"
    )
    return out


def publish_statements(runs):
    """Make the batch's entries visible, once all their files are uploaded."""
    ids = qarray([r["entry_id"] for r in runs], "int")
    run_ids = qarray([r["run_id"] for r in runs], "text")
    return [
        f"UPDATE dev.seqrun SET hidden = false WHERE id = ANY({ids}) AND alt_id->>'original' = ANY({run_ids});",
        "SELECT json_build_object("
        f"'published', (SELECT coalesce(json_agg(id ORDER BY id), '[]'::json) FROM dev.seqrun "
        f"WHERE id = ANY({ids}) AND hidden IS NOT TRUE), "
        "'visible_entries', (SELECT count(*) FROM dev.seqrun WHERE hidden IS NOT TRUE))::jsonb;",
    ]


def release_statements(runs, samples, pubs):
    """Undo a reservation whose upload failed: remove this batch's entries
    (still hidden) and the samples and publications it created, if nothing
    else uses them."""
    ids = qarray([r["entry_id"] for r in runs], "int")
    run_ids = qarray([r["run_id"] for r in runs], "text")
    sample_ids = qarray([s["id"] for s in samples], "int")
    pub_ids = qarray([p["id"] for p in pubs], "int")
    return [
        f"DELETE FROM dev.seqrun WHERE id = ANY({ids}) AND hidden AND alt_id->>'original' = ANY({run_ids});",
        f"DELETE FROM dev.sample s WHERE s.id = ANY({sample_ids}) "
        "AND NOT EXISTS (SELECT 1 FROM dev.seqrun r WHERE r.sample_id = s.id);",
        f"DELETE FROM dev.publication p WHERE p.id = ANY({pub_ids}) "
        "AND NOT EXISTS (SELECT 1 FROM dev.seqrun r WHERE r.publication_id = p.id);",
        f"SELECT to_jsonb((SELECT count(*) FROM dev.seqrun WHERE id = ANY({ids})));",
    ]


def backup_database(path):
    """pg_dump of the whole database to a local .sql.gz file."""
    remote = "sudo docker exec -i {} pg_dump -U postgres -d {}".format(
        shlex.quote(CFG["db_container"]), shlex.quote(CFG["db_name"])
    )
    proc = subprocess.Popen(ssh_cmd(remote), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    with gzip.open(path, "wb") as out:
        shutil.copyfileobj(proc.stdout, out, 1 << 20)
    err = proc.stderr.read().decode("utf-8", "replace")
    if proc.wait() != 0:
        raise DBError(f"database backup failed: {err.strip()}")
    if os.path.getsize(path) < 100000:
        raise DBError(f"database backup looks too small: {path}")


def reservation_saved(runs):
    """Whether this batch's entries are in the database: True or False, or
    None if the database can't be asked."""
    ids = qarray([r["entry_id"] for r in runs], "int")
    run_ids = qarray([r["run_id"] for r in runs], "text")
    try:
        return psql_json(f"SELECT to_jsonb((SELECT count(*) FROM dev.seqrun WHERE id = ANY({ids}) "
                         f"AND alt_id->>'original' = ANY({run_ids})));") > 0
    except Exception:  # noqa: BLE001
        return None


def s3_prefix_is_empty(prefix):
    out = run(["aws", "s3api", "list-objects-v2", "--bucket", CFG["bucket"], "--prefix", prefix,
               "--max-keys", "1", "--query", "KeyCount", "--output", "text"])
    return out.strip() in ("0", "None", "")


def public_url(key):
    return f"https://s3.{CFG['bucket_region']}.amazonaws.com/{CFG['bucket']}/{key}"


def curl(url, head=False):
    cmd = ["curl", "-sS", "-m", "90", "--retry", "3", "-o", "/dev/null" if head else "-", "-w",
           "\n%{http_code}"] + (["-I"] if head else []) + [url]
    p = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    body, _, code = p.stdout.decode("utf-8", "replace").rpartition("\n")
    return code.strip(), body


# --------------------------------------------------------------------------
# Subcommands
# --------------------------------------------------------------------------
def cmd_template(args):
    os.makedirs(args.dir, exist_ok=True)
    for name, spec, intro in (
        ("metadata.tsv", RUN_COLUMNS,
         "One row per sequencing run (each row becomes one FinaleDB entry, EE<id>)."),
        ("publications.tsv", PUB_COLUMNS,
         "Optional: new publications referenced in the 'publication' column of metadata.tsv. "
         "Delete this file if you don't need it."),
    ):
        path = os.path.join(args.dir, name)
        if os.path.exists(path):
            print(f"{path} already exists; left unchanged")
            continue
        lines = [f"# {intro}", "# Lines starting with # are ignored. Columns:"]
        lines += [f"#   {c}{' (required)' if req else ''}: {desc}" for c, req, desc, _ in spec]
        lines.append("\t".join(c[0] for c in spec))
        lines.append("#" + "\t".join(c[3] for c in spec))
        with open(path, "w") as fh:
            fh.write("\n".join(lines) + "\n")
        print(f"wrote {path}")
    return 0


def cmd_add(args):
    batch_dir = os.path.abspath(args.dir)
    if not os.path.isdir(batch_dir):
        raise UserError(f"not a folder: {args.dir}")
    meta_path = find_file(batch_dir, args.metadata, "metadata")
    if not meta_path:
        raise UserError(f"no metadata.tsv in {batch_dir} (create one with the 'template' command)")
    pub_path = find_file(batch_dir, args.publications, "publications")
    staging = os.path.abspath(args.staging or os.path.join(batch_dir, STAGING_NAME))
    require_tools(["gzip", "bgzip", "tabix", "sort", "aws", "ssh", "curl"])

    log(f"Reading {os.path.basename(meta_path)}" + (f" and {os.path.basename(pub_path)}" if pub_path else ""))
    runs, errors = parse_runs(meta_path, batch_dir)
    pubs, perrors = parse_publications(pub_path)
    errors += perrors
    if not errors:
        log(f"Checking the first lines of {sum(len(r['files']) for r in runs)} fragment file(s)")
        for r in runs:
            for asm, path in r["files"].items():
                try:
                    scan_fragments(path, asm, limit=5000)
                except UserError as e:
                    errors.append(f"{r['where']}: {e}")
    if errors:
        raise UserError("please fix these problems first:\n  - " + "\n  - ".join(errors))

    log("Checking AWS access")
    run(["aws", "s3api", "head-bucket", "--bucket", CFG["bucket"]])
    log(f"Checking the batch against the FinaleDB database ({CFG['ssh_target']})")
    snap = db_snapshot(runs)
    errors, notes, samples, new_pubs = resolve_against_db(runs, pubs, snap, args)
    if errors:
        raise UserError("please fix these problems first:\n  - " + "\n  - ".join(errors))
    for n in notes:
        log(f"note: {n}")

    log("")
    log(f"Plan: {len(runs)} new entr{'y' if len(runs) == 1 else 'ies'} "
        f"EE{runs[0]['entry_id']}..EE{runs[-1]['entry_id']}, {len(samples)} new sample(s), "
        f"{len(new_pubs)} new publication(s)" + (", added HIDDEN" if args.hidden else ""))
    for r in runs:
        pub = r["pub"]["label"] if r["pub"] else "no publication"
        log(f"  EE{r['entry_id']}  {r['run_id']:<16} {'+'.join(r['files']):<10} sample {r['sample']['name']} "
            f"({'new' if r['sample_is_new'] else 'existing'} id {r['sample_id']}), "
            f"{r['sample']['disease']}, {r['sample']['tissue']}, {pub}")
    for p in new_pubs:
        log(f"  publication {p['id']}: {p['label']} ({p['cite_short']})")

    log("")
    log(f"Converting fragment files into {staging}")
    os.makedirs(staging, exist_ok=True)
    stats, uploads = {}, []
    with tempfile.TemporaryDirectory(dir=staging, prefix=".sort_") as tmpdir:
        for r in runs:
            for asm in ASSEMBLIES:
                if asm in r["files"]:
                    st, up = stage_files(r, asm, staging, args.threads, tmpdir)
                    stats[(r["entry_id"], asm)] = st
                    uploads += up
    total_bytes = sum(os.path.getsize(p) for p, _ in uploads)

    stamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    reserve_sql = txn(reserve_statements(runs, samples, new_pubs, stats, update_sequences=not args.dry_run),
                      commit=not args.dry_run)
    publish_sql = txn(publish_statements(runs), commit=True)
    sql_path = os.path.join(staging, f"{'dryrun' if args.dry_run else 'added'}_{stamp}.sql")
    with open(sql_path, "w") as fh:
        fh.write(reserve_sql if args.dry_run or args.hidden else reserve_sql + publish_sql)

    if args.dry_run:
        log("")
        log("Dry run: running the database changes in a transaction and rolling them back")
        result = psql_json(reserve_sql)
        if result["entries"] != [r["entry_id"] for r in runs]:
            raise DBError(f"unexpected dry-run result: {result}")
        log(f"  OK: the database accepted {len(result['entries'])} entries, {result['samples']} sample(s), "
            f"{result['publications']} publication(s); everything was rolled back")
        log("")
        log(f"Dry run finished. Nothing was uploaded and the database is unchanged.")
        log(f"  Converted files ({total_bytes / 1e6:,.1f} MB) are in {staging}; the real run reuses them.")
        log(f"  SQL that would run: {sql_path}")
        log(f"  Run the same command without --dry-run to add the batch.")
        return 0

    log("")
    log(f"Ready to upload {len(uploads)} files ({total_bytes / 1e6:,.1f} MB) to s3://{CFG['bucket']}/entries/ "
        f"and add {len(runs)} entries to the database.")
    if not args.yes:
        try:
            answer = input("Proceed? Type yes to continue: ").strip().lower()
        except EOFError:  # no terminal (e.g. a batch job): use --yes there
            answer = ""
        if answer not in ("y", "yes"):
            log("Stopped; nothing was uploaded or changed.")
            return 1

    for r in runs:
        if not s3_prefix_is_empty(f"entries/EE{r['entry_id']}/"):
            raise UserError(f"s3://{CFG['bucket']}/entries/EE{r['entry_id']}/ already has files; "
                            "someone may have added entries meanwhile. Run the script again.")

    backup = os.path.join(staging, f"db_backup_before_{stamp}.sql.gz")
    log(f"Backing up the database to {backup}")
    backup_database(backup)
    try:
        run(["aws", "s3", "cp", backup, CFG["backup_prefix"] + os.path.basename(backup), "--only-show-errors"])
        log(f"  copied to {CFG['backup_prefix']}{os.path.basename(backup)}")
    except RuntimeError as e:
        log(f"  WARNING: could not copy the backup to S3 (the local copy is kept): {e}")

    # Reserve the IDs before uploading anything. The entries are committed
    # hidden, so a batch that picked the same IDs at the same time fails here
    # instead of overwriting this batch's files.
    entry_list = " ".join(f"EE{r['entry_id']}" for r in runs)
    log(f"Reserving {entry_list} (saving the entries hidden until their files are uploaded)")
    try:
        reserved = psql_json(reserve_sql)
        log(f"  saved {len(reserved['entries'])} entries, {reserved['samples']} sample(s), "
            f"{reserved['publications']} publication(s)")
    except DBError:
        saved = reservation_saved(runs)
        if saved is None:
            log("  Could not tell whether the entries were saved. If they are in the database "
                "(hidden), remove them before retrying.")
        if not saved:
            raise
        log("  the database reported an error, but the entries were saved; continuing")

    log(f"Uploading {len(uploads)} files")
    done = []
    try:
        for path, key in uploads:
            run(["aws", "s3", "cp", path, f"s3://{CFG['bucket']}/{key}", "--only-show-errors"])
            done.append(key)
            log(f"  {key}")
    except BaseException:
        # This run owns the reserved IDs, so these files and rows are its own.
        log("The upload failed; removing this batch's uploaded files and reserved entries so it can be retried")
        for key in done:
            try:
                run(["aws", "s3", "rm", f"s3://{CFG['bucket']}/{key}", "--only-show-errors"])
            except RuntimeError as e:
                log(f"  could not remove s3://{CFG['bucket']}/{key}: {e}")
        try:
            left = psql_json(txn(release_statements(runs, samples, new_pubs), commit=True))
            if left:
                log(f"  WARNING: {left} reserved entries could not be removed; they stay hidden")
        except Exception as e:  # noqa: BLE001
            log(f"  could not remove the reserved entries (they stay hidden): {e}")
        raise

    if args.hidden:
        log(f"Leaving the entries hidden (--hidden). Show them with: python3 {sys.argv[0]} unhide {entry_list}")
    else:
        log("Making the entries visible on the portal")
        try:
            published = psql_json(publish_sql)
        except DBError as e:
            raise DBError(f"the files are uploaded and the entries saved, but they could not be made visible ({e}). "
                          f"Run: python3 {sys.argv[0]} unhide {entry_list}")
        log(f"  {len(published['published'])} entries visible; the portal now lists "
            f"{published['visible_entries']} entries")

    manifest = os.path.join(staging, f"added_{stamp}.tsv")
    with open(manifest, "w") as fh:
        fh.write("entry_id\trun_id\tsample_name\tassembly\tsource_file\tn_fragments\tfragment_file_url\n")
        for r in runs:
            for asm in ASSEMBLIES:
                if asm in r["files"]:
                    key = f"entries/EE{r['entry_id']}/{asm}/EE{r['entry_id']}.{asm}.frag.tsv.bgz"
                    fh.write(f"EE{r['entry_id']}\t{r['run_id']}\t{r['sample']['name']}\t{asm}\t{r['files'][asm]}\t"
                             f"{stats[(r['entry_id'], asm)]['n_fragments']}\t{public_url(key)}\n")

    log("Checking the website")
    problems = 0
    for r in runs:
        code, body = curl(f"{CFG['site']}/api/v1/seqrun/EE{r['entry_id']}")
        try:
            ok = code == "200" and json.loads(body)["results"][0]["id"] == r["entry_id"]
        except (ValueError, KeyError, IndexError):
            ok = False
        asm = next(iter(r["files"]))
        fcode, _ = curl(public_url(f"entries/EE{r['entry_id']}/{asm}/EE{r['entry_id']}.{asm}.frag.tsv.bgz"), head=True)
        problems += (not ok) + (fcode != "200")
        log(f"  EE{r['entry_id']}: portal API {'OK' if ok else 'PROBLEM (HTTP ' + code + ')'}, "
            f"public file {'OK' if fcode == '200' else 'PROBLEM (HTTP ' + fcode + ')'}")
    log("")
    log(f"Done. Added EE{runs[0]['entry_id']}..EE{runs[-1]['entry_id']}" + (" (hidden)" if args.hidden else ""))
    log(f"  Record of this batch: {manifest}")
    log(f"  To take entries off the portal again: python3 {sys.argv[0]} hide EE{runs[0]['entry_id']} ...")
    if problems:
        log(f"  WARNING: {problems} check(s) failed; see above")
        return 2
    return 0


def parse_entry_ids(values):
    ids = []
    for v in values:
        s = v.strip().upper()
        s = s[2:] if s.startswith("EE") else s
        if not s.isdigit():
            raise UserError(f"not an entry ID: {v} (expected e.g. EE88724)")
        ids.append(int(s))
    return sorted(set(ids))


def cmd_hide(args, hidden):
    ids = parse_entry_ids(args.entries)
    verb = "hid" if hidden else "unhid"
    sql = (
        "SET standard_conforming_strings = on;\nBEGIN;\n"
        f"WITH u AS (UPDATE dev.seqrun SET hidden = {q(hidden)} WHERE id = ANY({qarray(ids, 'int')}) RETURNING id) "
        "SELECT coalesce(json_agg(id ORDER BY id), '[]'::json)::jsonb FROM u;\n"
        + ("ROLLBACK;\n" if args.dry_run else "COMMIT;\n")
    )
    changed = psql_json(sql)
    missing = [i for i in ids if i not in changed]
    if args.dry_run:
        verb = "dry run (rolled back): would have " + ("hidden" if hidden else "unhidden")
    log(f"{verb} {len(changed)} entr{'y' if len(changed) == 1 else 'ies'}: "
        + (", ".join(f"EE{i}" for i in changed) or "none"))
    if missing:
        log("not found: " + ", ".join(f"EE{i}" for i in missing))
    return 0 if not missing else 1


def main(argv=None):
    ap = argparse.ArgumentParser(
        description="Add new sequencing runs to FinaleDB, or hide/unhide entries. See scripts/README.md.")
    sub = ap.add_subparsers(dest="command", required=True)

    t = sub.add_parser("template", help="write metadata.tsv and publications.tsv templates into a folder")
    t.add_argument("dir")

    a = sub.add_parser("add", help="convert, upload and register the runs listed in DIR/metadata.tsv")
    a.add_argument("dir", help="folder with the fragment files and metadata.tsv")
    a.add_argument("--dry-run", action="store_true",
                   help="do every check and conversion, test the database changes, then roll them back; upload nothing")
    a.add_argument("--yes", action="store_true", help="don't ask for confirmation before uploading")
    a.add_argument("--metadata", help="metadata file (default: DIR/metadata.tsv)")
    a.add_argument("--publications", help="publications file (default: DIR/publications.tsv, if present)")
    a.add_argument("--staging", help=f"where converted files go (default: DIR/{STAGING_NAME})")
    a.add_argument("--threads", type=int, default=max(1, min(4, os.cpu_count() or 1)),
                   help="bgzip threads (default: up to 4)")
    a.add_argument("--hidden", action="store_true",
                   help="add the entries hidden from the portal (show them later with 'unhide')")
    a.add_argument("--allow-new-values", action="store_true",
                   help="accept disease/tissue/instrument/assay values FinaleDB doesn't have yet")
    a.add_argument("--allow-existing-samples", action="store_true",
                   help="link runs to samples that already exist in FinaleDB (matched by sample_name)")

    for name, hidden in (("hide", True), ("unhide", False)):
        h = sub.add_parser(name, help=f"{'hide entries from' if hidden else 'show entries again on'} the portal")
        h.add_argument("entries", nargs="+", help="entry IDs, e.g. EE88724")
        h.add_argument("--dry-run", action="store_true", help="show what would change, change nothing")

    args = ap.parse_args(argv)
    try:
        if args.command == "template":
            return cmd_template(args)
        if args.command == "add":
            return cmd_add(args)
        return cmd_hide(args, hidden=(args.command == "hide"))
    except UserError as e:
        print(f"\nERROR: {e}", file=sys.stderr)
        return 1
    except (DBError, RuntimeError) as e:
        print(f"\nFAILED: {e}", file=sys.stderr)
        return 2
    except KeyboardInterrupt:
        print("\nInterrupted.", file=sys.stderr)
        return 130


if __name__ == "__main__":
    sys.exit(main())
