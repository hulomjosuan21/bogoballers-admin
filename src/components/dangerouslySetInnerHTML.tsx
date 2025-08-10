type HtmlContentProps = {
  htmlString: string;
};

export default function HtmlContent({ htmlString }: HtmlContentProps) {
  return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
}
