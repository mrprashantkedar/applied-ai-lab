# Applied AI Lab

Five interactive static web projects, each with its own route and research references.

| Route | Implementation |
| --- | --- |
| study/ | PDF.js text extraction and keyword-ranked evidence with page citations |
| interview/ | Python and Java practice with concept checklists and phrase-based feedback |
| expenses/ | Naive Bayes classifier trained on embedded synthetic examples, with editable predictions and CSV export |
| lost-found/ | Keyword or optional MiniLM semantic search, with browser-local reports |
| waste/ | CLIP zero-shot image labeling with an Unsure state |

Serve the folder over HTTP, for example with `python3 -m http.server 8000`.
PDF processing and optional models require internet on first use. Reports are local to the current browser. The projects are prototypes and the thresholds and classifiers have not been benchmarked.
