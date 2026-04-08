from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import ListFlowable, ListItem, Paragraph, SimpleDocTemplate, Spacer


def build_styles():
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="Body",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10.5,
            leading=16,
            spaceAfter=8,
            textColor=colors.HexColor("#334155")
        )
    )
    styles.add(
        ParagraphStyle(
            name="H1LifeAdmin",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=24,
            leading=28,
            spaceAfter=14,
            textColor=colors.HexColor("#14213D")
        )
    )
    styles.add(
        ParagraphStyle(
            name="H2LifeAdmin",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            spaceBefore=10,
            spaceAfter=8,
            textColor=colors.HexColor("#C44536")
        )
    )
    styles.add(
        ParagraphStyle(
            name="H3LifeAdmin",
            parent=styles["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=15,
            spaceBefore=8,
            spaceAfter=6,
            textColor=colors.HexColor("#14213D")
        )
    )
    styles.add(
        ParagraphStyle(
            name="BulletLifeAdmin",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10.5,
            leading=15,
            leftIndent=14,
            firstLineIndent=0,
            textColor=colors.HexColor("#334155"),
            alignment=TA_LEFT
        )
    )
    return styles


def parse_markdown(markdown_text: str, styles):
    story = []
    bullet_buffer: list[str] = []

    def flush_bullets():
      nonlocal bullet_buffer
      if not bullet_buffer:
        return
      story.append(
          ListFlowable(
              [
                  ListItem(Paragraph(apply_inline_markup(item), styles["BulletLifeAdmin"]))
                  for item in bullet_buffer
              ],
              bulletType="bullet",
              start="circle",
              leftIndent=12
          )
      )
      story.append(Spacer(1, 4))
      bullet_buffer = []

    for raw_line in markdown_text.splitlines():
      line = raw_line.rstrip()
      if not line:
        flush_bullets()
        story.append(Spacer(1, 4))
        continue

      if line.startswith("# "):
        flush_bullets()
        story.append(Paragraph(apply_inline_markup(line[2:].strip()), styles["H1LifeAdmin"]))
        continue

      if line.startswith("## "):
        flush_bullets()
        story.append(Paragraph(apply_inline_markup(line[3:].strip()), styles["H2LifeAdmin"]))
        continue

      if line.startswith("### "):
        flush_bullets()
        story.append(Paragraph(apply_inline_markup(line[4:].strip()), styles["H3LifeAdmin"]))
        continue

      if line.startswith("- "):
        bullet_buffer.append(line[2:].strip())
        continue

      flush_bullets()
      story.append(Paragraph(apply_inline_markup(line), styles["Body"]))

    flush_bullets()
    return story


def apply_inline_markup(text: str) -> str:
    formatted = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    while "**" in formatted:
      start = formatted.find("**")
      end = formatted.find("**", start + 2)
      if end == -1:
        break
      inner = formatted[start + 2 : end]
      formatted = f"{formatted[:start]}<b>{inner}</b>{formatted[end + 2:]}"
    while "`" in formatted:
      start = formatted.find("`")
      end = formatted.find("`", start + 1)
      if end == -1:
        break
      inner = formatted[start + 1 : end]
      formatted = f"{formatted[:start]}<font face='Courier'>{inner}</font>{formatted[end + 1:]}"
    return formatted


def generate_pdf(source: Path, destination: Path):
    styles = build_styles()
    story = parse_markdown(source.read_text(encoding="utf-8"), styles)
    destination.parent.mkdir(parents=True, exist_ok=True)
    document = SimpleDocTemplate(
        str(destination),
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=16 * mm,
        title="Life Admin Architecture"
    )
    document.build(story)


def main():
    if len(sys.argv) != 3:
      raise SystemExit("Usage: python3 generate_architecture_pdf.py <input.md> <output.pdf>")

    source = Path(sys.argv[1]).resolve()
    destination = Path(sys.argv[2]).resolve()
    if not source.exists():
      raise SystemExit(f"Missing markdown source: {source}")

    generate_pdf(source, destination)
    print(destination)


if __name__ == "__main__":
    main()

