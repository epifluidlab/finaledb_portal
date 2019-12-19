## 2019-12-19

- Switched to `sequelize`, an ORM for SQL-based datastores.
- Create `sequelize` models, see `./models` directory. Also aliased snakecase column names to camelcase (`read_length` becomes `readLength`) to keep casing consistent across codebase.
- Refactored API routes to be more REST-like.
    - Moved route implementations to `./routes` folder.
    - Routes now organized roughly by table. For example, `/publications` to get just publications, `/samples` to get samples, `/samples/diseases` to get just disease data.
- For filtering, client passes filter as query parameter in API call. See `./client/src/pages/QueryPage.react.js` line `151` for implementation details.
    - Example API call: `http://localhost:3000/samples?platform=Illumina%20HiSeq%204000,HiSeq%20X%20Ten&` will filter for samples that have either `Illumina HiSeq 4000` or `HiSeq X Ten` in platform column.
    - Query parameters are parsed by the route handler as follows (see `./routes/samples.js`):
    ```javascript
    // Get the filters from user request.
    const platformFilter = req.query.platform ? req.query.platform.split(',') : [];

    const samples = await Sample.findAll({
      // Apply the filters, unless there were no filters in the request.
      where: platformFilter.length ? {
        platform: {
          [Op.in]: platformFilter
        }
      } : {}
    });
    ```
    - The equivalent SQL query is:
    ```sql
    SELECT other_columns, "instrument" AS "platform" FROM "metadata" AS "Sample" WHERE "Sample"."instrument" IN ('Illumina HiSeq 4000', 'HiSeq X Ten');
    ```