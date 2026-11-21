# Pinned quick filters for Notion views

View operations create_view, update_view, and ensure_dashboard_widget accept optional `quick_filters`.
Keys are data-source property names or IDs; values are property filter conditions without a `property` field.
These are separate from advanced `where`/`filter` clauses.

Example:
```json
{"data_source_id":"<id>","name":"Active releases","type":"table","quick_filters":{"Status":{"status":{"equals":"In Progress"}}}}
```

`update_view` **patches individual keys**, it does not replace the whole saved map. Unmentioned keys are preserved.
For example, `quick_filters: {"Status":{"status":{"equals":"Done"}}}` changes Status but retains any Owner chip.
Use `quick_filters: {"Status":null}` to remove only the Status chip. Use `clear: ["quick_filters"]` to remove **all** chips.
Providing both a quick-filter patch and `clear:["quick_filters"]` is rejected.
Null values are accepted only in update patches; create_view and ensure_dashboard_widget require conditions.
Invalid or empty condition objects and compound and/or selectors are rejected before contacting Notion.
get_view and other compact readbacks now preserve quick_filters, including explicit null.

Dashboard reconciliation compares quick filters, advanced filters, source and type before reusing an existing widget. Property names and encoded IDs are normalized using source schema. Mismatches are held as `dashboard_widget_conflict`, never silently duplicated. Use dry_run:true before changes.

Release gate: perform the governed local release validator (no GitHub Actions) and separately verify authorized disposable-view create/read/update/read/clear/read persistence before deploying. Maintain the managed runtime, immutable package, rollback and connector verification gates.

References: https://developers.notion.com/reference/create-view and https://developers.notion.com/reference/update-a-view
