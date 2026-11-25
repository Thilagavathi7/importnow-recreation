function Button({
  children,
  variant = 'primary',
  href,
  type = 'button',
  className = '',
  ...props
}) {
  const Element = href ? 'a' : 'button'
  const classes = ['button', `button--${variant}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <Element
      className={classes}
      href={href}
      type={href ? undefined : type}
      {...props}
    >
      {children}
    </Element>
  )
}

export default Button
