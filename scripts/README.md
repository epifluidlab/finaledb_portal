# Adding new data to FinaleDB

`finaledb_entries.py` adds new sequencing runs to FinaleDB in one step. It
converts and renames your fragment files the FinaleDB way, uploads them to the
public S3 bucket and adds the runs, samples and publications to the database.
The website reads the database directly, so new entries, counts and filter
options appear on https://finaledb.research.cchmc.org as soon as the script
finishes. Nothing needs to be redeployed.

## One-time setup

You need, on the computer where the fragment files are:

- **python3** (3.8 or newer; no extra packages)
- **bgzip and tabix**: `brew install htslib` or `conda install -c bioconda htslib`
- **aws CLI** logged in to the lab AWS account. `aws sts get-caller-identity`
  should show `liulab_admin`.
- **The database server's SSH key** at `~/.ssh/epifluidlab_aws_ohio.pem`
  (ask the lab admin if you don't have it)
- `gzip`, `sort` and `curl`, which macOS and Linux already have

To check that the database connection works (this changes nothing):

```bash
python3 scripts/finaledb_entries.py hide EE85723 --dry-run
```

## Adding a batch

1. **Put the fragment files in one folder**, e.g. `~/finaledb_new/2026-11/`.

2. **Create the metadata templates** in that folder:

   ```bash
   python3 scripts/finaledb_entries.py template ~/finaledb_new/2026-11
   ```

3. **Fill in `metadata.tsv`**, with one row per sequencing run (see
   [the columns](#metadatatsv)). Excel works: save as *Tab delimited text*
   or CSV. If the runs come from a paper that isn't in FinaleDB yet, also fill in
   `publications.tsv`. Otherwise delete it.

4. **Do a dry run** and fix whatever it reports:

   ```bash
   python3 scripts/finaledb_entries.py add ~/finaledb_new/2026-11 --dry-run
   ```

   The dry run does everything except uploading and saving. It checks the
   metadata and files, checks for duplicates and misspellings against the live
   database, converts all fragment files, and runs the database changes inside a
   transaction that it then rolls back. It prints the EE IDs the runs will get.

5. **Add the batch for real**:

   ```bash
   python3 scripts/finaledb_entries.py add ~/finaledb_new/2026-11
   ```

   The real run reuses the files the dry run converted. It shows the plan and
   asks for confirmation. Then it backs up the database and reserves the EE
   IDs by saving the entries hidden. Next it uploads the files, makes the
   entries visible and checks that the website serves them. If an upload fails,
   it removes that batch's files and reserved entries, so you can just run it
   again. Because the IDs are reserved before anything is uploaded, two people
   adding batches at the same time can't overwrite each other's files. Add
   `--hidden` to review the entries before they appear on the portal, then show
   them with `unhide`.

The run ends with a record of what was added, in
`finaledb_upload/added_<date>.tsv` inside the batch folder. It lists each EE ID,
your run ID, the source file and the public download URL.

## Fragment files

Accepted input:

- **BED6**, as made by the FinaleDB snakemake workflow:
  `chrom, start, end, name, MAPQ, strand` (the name column is dropped)
- **FinaleDB's own 5 columns**: `chrom, start, end, MAPQ, strand`
- plain text, gzip or bgzip; file names don't matter; `#` header lines are skipped

The script converts each file to FinaleDB's format:

- **Chromosome names:** hg19 files use GRCh37 names (`1`…`22`, `X`, `Y`, `MT`)
  and hg38 files use UCSC names (`chr1`…`chrM`). Main chromosomes written the
  other way are renamed. Other contigs are kept as they are.
- **Sorting:** files that are already sorted by position are kept in their
  order. Unsorted files are sorted the way existing FinaleDB files are.
- **Compression:** bgzip, with a tabix index (`tabix -p bed`).

Your original files are never changed. The converted copies go into
`finaledb_upload/` inside the batch folder. You can delete that folder after a
successful run.

### What gets created for each run

The run gets the next free ID, e.g. EE88724. For each assembly it has:

| File (in `s3://finaledb.epifluidlab.cchmc.org/entries/EE88724/hg38/`) | Used by the portal for |
|---|---|
| `EE88724.hg38.frag.tsv.bgz` | the download list |
| `EE88724.hg38.frag.tsv.bgz.tbi` | region queries with tabix |
| `EE88724.hg38.insert_size_metrics.txt` | the fragment-size chart (Picard format, computed from the fragments) |

In the database, it gets one `dev.seqrun` row (the entry), plus a `dev.sample`
row and a `dev.publication` row when those are new.

## metadata.tsv

One row per sequencing run. Each row becomes one FinaleDB entry.

| Column | Required | Meaning |
|---|---|---|
| `run_id` | yes | Your ID for the run; stored as the entry's original ID |
| `frag_hg19` | one of these two | Fragment file aligned to hg19/GRCh37 |
| `frag_hg38` | one of these two | Fragment file aligned to hg38 |
| `sample_name` | yes | Biological sample name. Must be new to FinaleDB; several runs of one sample share it |
| `disease` | yes | e.g. `Healthy`, `Breast cancer`, `Prostate cancer` |
| `subtype` | | e.g. `MBC`, `CRPC`, `HCC` |
| `tissue` | yes | e.g. `blood plasma`, `urine` |
| `gender` | | `male`, `female` or `mixed` |
| `age` | | years |
| `assay` | | `WGS` (default) or `WXS` |
| `instrument` | yes | e.g. `NovaSeq 6000`, `HiSeq X Ten` |
| `read_length` | yes | bp |
| `seq_layout` | | `PAIRED` (default) or `SINGLE` |
| `publication` | | Label of a FinaleDB publication (e.g. `snyder2016cell`) or of a new one in `publications.tsv`. Leave empty for unpublished data |
| `sra_id` | | SRA run accession (`SRR…`); shown as the entry's ID on the portal |
| `geo_id` | | GEO sample accession (`GSM…`) |
| `mbases`, `num_reads` | | Sequencing yield |
| `comment` | | Defaults to the publication label, or `in-house` |

Spelling: values that match an existing FinaleDB value apart from case or
spacing are rewritten to FinaleDB's spelling (`healthy` → `Healthy`). A value
FinaleDB has never seen stops the run, with suggestions, because it's usually a
typo and would show up as a separate category on the portal. If it really is a
new disease, tissue, instrument or assay, add `--allow-new-values`.

## publications.tsv

Only needed for papers that aren't in FinaleDB yet.

| Column | Required | Meaning |
|---|---|---|
| `label` | yes | Short unique label used in metadata.tsv, e.g. `smith2026natcomm` |
| `title`, `journal`, `first_author` | yes | |
| `date` | yes | `YYYY-MM-DD` |
| `pmid`, `doi` | | |
| `link` | | Defaults to `https://doi.org/<doi>` (or the PubMed page) |
| `cite_short` | | Shown on the portal; defaults to `<last name> et al., <year>` |

## Fixing mistakes

- **Before the real run:** fix the files or metadata and run again. Dry runs change nothing.
- **After the real run:** take entries off the portal right away with
  `python3 scripts/finaledb_entries.py hide EE88724 EE88725`. `unhide` reverses
  it. To correct metadata, hide the entries and add the runs again with new run
  IDs, or edit the rows in the database.
- **Backups:** every real run first saves a full database dump to
  `finaledb_upload/db_backup_before_<date>.sql.gz`, and copies it to
  `s3://epifluidlab-storage-backup/finaledb_db_dumps/`.

## Limits

- Genome-browser tracks (coverage, fragment profile and WPS bigWigs) are not
  created. New entries show up in search, summaries, downloads and the
  fragment-size chart, but not as tracks in the browser view.
- Files are not copied to the Globus endpoint `FinaleDB_northwestern_2023`.
- Conversion takes about a minute per 50 million fragments (measured on a
  Mac), plus the upload time. Files that need sorting take longer.

## Where FinaleDB runs

You can change any of these with environment variables, e.g. if the server moves.

| What | Default | Variable |
|---|---|---|
| Database server (SSH) | `ubuntu@18.190.7.192` (EC2 `finaledb_ec2`, us-east-2) | `FINALEDB_SSH` |
| SSH key | `~/.ssh/epifluidlab_aws_ohio.pem` | `FINALEDB_SSH_KEY` |
| PostgreSQL container / database | `psql_finaledb_1` / `finaledb` (schema `dev`) | `FINALEDB_DB_CONTAINER`, `FINALEDB_DB_NAME` |
| Public data bucket | `finaledb.epifluidlab.cchmc.org` (us-east-2) | `FINALEDB_BUCKET`, `FINALEDB_BUCKET_REGION` |
| Database backups | `s3://epifluidlab-storage-backup/finaledb_db_dumps/` | `FINALEDB_BACKUP_PREFIX` |
| Website (Heroku app `finaledb`) | `https://finaledb.research.cchmc.org` | `FINALEDB_SITE` |
