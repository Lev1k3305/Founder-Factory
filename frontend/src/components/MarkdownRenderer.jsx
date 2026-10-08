import React from "react";

function renderInline(text, keyPrefix) {
  if (!text) return null;
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={key}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={key}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

export function MarkdownRenderer({ content }) {
  if (!content) return null;

  const lines = content.split(/\r?\n/);
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    // Headings
    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      const HeadingTag = level === 1 ? "h2" : level === 2 ? "h3" : "h4";
      blocks.push(
        <HeadingTag key={`heading-${index}`}>
          {renderInline(heading[2], `heading-${index}`)}
        </HeadingTag>
      );
      index += 1;
      continue;
    }

    // Horizontal Rule
    if (/^---+$/.test(line) || /^\*\*\*+$/.test(line)) {
      blocks.push(<hr key={`rule-${index}`} />);
      index += 1;
      continue;
    }

    // Blockquote
    if (line.startsWith(">")) {
      const quoteLines = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      blocks.push(
        <blockquote key={`quote-${index}`}>
          <MarkdownRenderer content={quoteLines.join("\n")} />
        </blockquote>
      );
      continue;
    }

    // Table
    if (line.includes("|") && index + 1 < lines.length && /^\s*\|?\s*[-:]+[-|\s:]*$/.test(lines[index + 1].trim())) {
      const parseRow = (rowStr) =>
        rowStr
          .trim()
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((c) => c.trim());

      const headers = parseRow(line);
      index += 2; // Skip header and separator line
      const rows = [];

      while (index < lines.length && lines[index].trim().includes("|")) {
        rows.push(parseRow(lines[index]));
        index += 1;
      }

      blocks.push(
        <div key={`table-${index}`} className="table-responsive">
          <table>
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={`th-${i}`}>{renderInline(h, `th-${i}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr key={`tr-${rIdx}`}>
                  {row.map((cell, cIdx) => (
                    <td key={`td-${rIdx}-${cIdx}`}>
                      {renderInline(cell, `td-${rIdx}-${cIdx}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    // Lists
    const unordered = line.match(/^\s*[-*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      const isOrdered = Boolean(ordered);
      const ListTag = isOrdered ? "ol" : "ul";
      const items = [];
      while (index < lines.length) {
        const itemLine = lines[index].trim();
        const item = itemLine.match(
          isOrdered ? /^\d+[.)]\s+(.+)$/ : /^[-*]\s+(.+)$/
        );
        if (!item) break;
        items.push(
          <li key={`item-${index}`}>
            {renderInline(item[1], `item-${index}`)}
          </li>
        );
        index += 1;
      }
      blocks.push(<ListTag key={`list-${index}`}>{items}</ListTag>);
      continue;
    }

    // Paragraph
    const paragraph = [line];
    index += 1;
    while (index < lines.length && lines[index].trim()) {
      const next = lines[index].trim();
      if (
        /^(#{1,4})\s+/.test(next) ||
        /^---+$/.test(next) ||
        /^[-*]\s+/.test(next) ||
        /^\d+[.)]\s+/.test(next) ||
        next.startsWith(">") ||
        next.includes("|")
      ) {
        break;
      }
      paragraph.push(next);
      index += 1;
    }
    blocks.push(
      <p key={`paragraph-${index}`}>
        {renderInline(paragraph.join(" "), `paragraph-${index}`)}
      </p>
    );
  }

  return <>{blocks}</>;
}
