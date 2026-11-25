function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  as: Heading = 'h2',
  titleId,
  className = '',
}) {
  const classes = [
    'section-heading',
    `section-heading--${align}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      {eyebrow && <p className="section-heading__eyebrow">{eyebrow}</p>}
      <Heading className="section-heading__title" id={titleId}>
        {title}
      </Heading>
      {description && (
        <p className="section-heading__description">{description}</p>
      )}
    </div>
  )
}

export default SectionHeading
