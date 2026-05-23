import re


def strip_html(raw: str, max_len: int = 8000) -> str:
    """Remove tags/scripts so agents get readable text, not page source."""
    text = re.sub(r"<script[^>]*>[\s\S]*?</script>", " ", raw, flags=re.I)
    text = re.sub(r"<style[^>]*>[\s\S]*?</style>", " ", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:max_len]
