/**
 * Lightweight XML parser for EDI documents.
 * Handles simple element-based XML (no attributes, no namespaces).
 * For complex XML, consider adding fast-xml-parser.
 */

interface XmlNode {
  tag: string;
  children: XmlNode[];
  text: string;
}

/**
 * Parse XML content into an array of key-value rows.
 * Expects structure like:
 *   <Document>
 *     <Row><Field1>val</Field1><Field2>val</Field2></Row>
 *     <Row>...</Row>
 *   </Document>
 */
export function parseXml(content: string): Record<string, string>[] {
  const cleaned = content.trim();
  const root = parseXmlNode(cleaned);
  if (!root) return [];

  // Find repeating child elements (these are our rows)
  const rows: Record<string, string>[] = [];

  for (const child of root.children) {
    const row: Record<string, string> = {};
    for (const field of child.children) {
      row[field.tag] = field.text;
    }
    if (Object.keys(row).length > 0) {
      rows.push(row);
    }
  }

  return rows;
}

function parseXmlNode(xml: string): XmlNode | null {
  const tagMatch = xml.match(/^<([a-zA-Z_][\w.-]*)[^>]*>/);
  if (!tagMatch) return null;

  const tag = tagMatch[1];
  const openTag = tagMatch[0];
  const closeTag = `</${tag}>`;
  const closeIdx = xml.lastIndexOf(closeTag);
  if (closeIdx === -1) return null;

  const inner = xml.slice(openTag.length, closeIdx).trim();

  // Check if inner is text content (no child tags)
  if (!inner.includes('<')) {
    return { tag, children: [], text: inner };
  }

  // Parse children
  const children: XmlNode[] = [];
  let pos = 0;
  while (pos < inner.length) {
    const nextOpen = inner.indexOf('<', pos);
    if (nextOpen === -1) break;

    const childTagMatch = inner.slice(nextOpen).match(/^<([a-zA-Z_][\w.-]*)[^>]*>/);
    if (!childTagMatch) break;

    const childTag = childTagMatch[1];
    const childClose = `</${childTag}>`;
    const childCloseIdx = inner.indexOf(childClose, nextOpen);
    if (childCloseIdx === -1) break;

    const childXml = inner.slice(nextOpen, childCloseIdx + childClose.length);
    const childNode = parseXmlNode(childXml);
    if (childNode) children.push(childNode);

    pos = childCloseIdx + childClose.length;
  }

  return { tag, children, text: '' };
}

/**
 * Generate XML content from an array of key-value rows.
 */
export function generateXml(
  rows: Record<string, unknown>[],
  rootTag = 'Document',
  rowTag = 'Row'
): string {
  const lines: string[] = [`<?xml version="1.0" encoding="UTF-8"?>`, `<${rootTag}>`];

  for (const row of rows) {
    lines.push(`  <${rowTag}>`);
    for (const [key, value] of Object.entries(row)) {
      const escaped = escapeXml(value === null || value === undefined ? '' : String(value));
      lines.push(`    <${key}>${escaped}</${key}>`);
    }
    lines.push(`  </${rowTag}>`);
  }

  lines.push(`</${rootTag}>`);
  return lines.join('\n');
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
