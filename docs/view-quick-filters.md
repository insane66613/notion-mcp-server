# Pinned quick filters for Notion views

View operations create_view, update_view, and ensure_dashboard_widget accept optional `quick_filters`.
Keys are data-source property names or IDs; values are property filter conditions without a `property` field.
These are separate from advanced `where`/`filter` clauses.

Example:
```json
{"data_source_id":"<id>","name":"Active releases","type":"table","quick_filters":{"Status":{"status":{"equals":"In Progress"}}}}
```

Use update_view with `clear: ["quick_filters"]` to explicitly remove pinned filters. Supplying clear and a replacement in one request is rejected.
Invalid or empty condition objects and compound and/or selectors are rejected before contacting Notion.
get_view and other compact readbacks now preserve quick_filters, including explicit null.

Dashboard reconciliation compares quick filters, advanced filters, source and type before reusing an existing widget. Property names and encoded IDs are normalized using source schema. Mismatches are held as `dashboard_widget_conflict`, never silently duplicated. Use dry_run:true before changes.

Release gate: no production change until CI and disposable-view API readback confirm persistence. Maintain the managed runtime, rollback and connector verification gates.

Reference: https://developers.notion.com/reference/create-view
