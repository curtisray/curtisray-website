const footer = document.querySelector('.site-footer-full');
if (footer) {
  const root = document.documentElement;
  const theme = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );
  const originalTheme = theme?.content || '#ffffff';
  function setCanvas(dark: boolean) {
    root.style.setProperty(
      '--page-canvas',
      dark ? 'var(--color-black)' : 'var(--color-paper)',
    );
    if (theme) theme.content = dark ? '#000000' : originalTheme;
  }
  // Keep top overscroll white; match the black footer as it enters the viewport.
  setCanvas(false);
  const observer = new IntersectionObserver(([entry]) =>
    setCanvas(entry.isIntersecting),
  );
  observer.observe(footer);
  if (import.meta.hot)
    import.meta.hot.dispose(() => {
      observer.disconnect();
      root.style.removeProperty('--page-canvas');
      if (theme) theme.content = originalTheme;
    });
}
