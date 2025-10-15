// src/components/blocks/Section.tsx
interface NCOSSectionProps {
  gutters?: boolean | string;
  theme?: string;
  width?: string;
  className?: string;
  metadata?: any;
  innerBlocks?: any[];
  children?: React.ReactNode;
}

export function Section({ 
  gutters = false, 
  theme = 'default', 
  width = 'full', 
  className = '', 
  innerBlocks, 
  children, 
  ...props 
}: NCOSSectionProps) {
  const sectionClass = [
    'ncos-section',
    theme && `theme-${theme}`,
    width && `width-${width}`,
    gutters && 'has-gutters',
    className
  ].filter(Boolean).join(' ');

  return (
    <section className={sectionClass} {...props}>
      <div className="section-inner">
        {children || innerBlocks?.map((block, idx) => (
          // Render inner blocks recursively
          <div key={idx} dangerouslySetInnerHTML={{ __html: block.innerHTML }} />
        ))}
      </div>
    </section>
  );
}