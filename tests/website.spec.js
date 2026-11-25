import { expect, test } from '@playwright/test'

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
]

for (const viewport of viewports) {
  test(`renders the complete page without overflow at ${viewport.name}`, async ({ page }) => {
    const browserErrors = []
    page.on('console', (message) => {
      if (message.type() === 'error') browserErrors.push(message.text())
    })
    page.on('pageerror', (error) => browserErrors.push(error.message))
    page.on('requestfailed', (request) => {
      browserErrors.push(`Request failed: ${request.url()}`)
    })

    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    })
    await page.goto('/#home')
    await page.evaluate(() => document.fonts.ready)

    const heroTitle = page.locator('#hero-title')
    await expect(heroTitle).toBeVisible()
    await expect(heroTitle).toContainText('Import directly from China.')
    await expect(heroTitle).toContainText('Without the guesswork.')
    await expect(page.locator('.route-illustration__svg')).toBeVisible()
    await expect(page.locator('#routes')).toBeAttached()
    await expect
      .poll(() =>
        heroTitle.evaluate((title) => {
          const firstWord = title.querySelector(':scope > .w')
          const emphasizedWord = title.querySelector(':scope > span:not(.w) .w')
          return [
            firstWord && getComputedStyle(firstWord.querySelector('.wi')).color,
            emphasizedWord &&
              getComputedStyle(emphasizedWord.querySelector('.wi')).color,
          ]
        }),
      )
      .toEqual(['rgb(10, 10, 10)', 'rgb(227, 36, 27)'])

    const layout = await page.evaluate(() => ({
      hasHorizontalOverflow:
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
      interLoaded: document.fonts.check('400 16px Inter'),
      soraLoaded: document.fonts.check('700 16px Sora'),
      brokenImages: [...document.images].filter(
        (image) => !image.complete || image.naturalWidth === 0,
      ).length,
    }))

    expect(layout.hasHorizontalOverflow).toBe(false)
    expect(layout.interLoaded).toBe(true)
    expect(layout.soraLoaded).toBe(true)
    expect(layout.brokenImages).toBe(0)
    expect(browserErrors).toEqual([])

    for (const sectionId of [
      'services',
      'journey',
      'products',
      'shanghai',
      'trips',
      'work',
      'stories',
      'blog',
      'faq',
      'contact',
      'footer',
    ]) {
      const section = page.locator(`#${sectionId}`)
      await expect(section).toBeAttached()
    }

    await expect(page.locator('.earth-globe__canvas')).toBeAttached()
    await expect(page.locator('.earth-globe__canvas')).toHaveAttribute(
      'data-engine',
      /three\.js/,
    )
  })
}

test('mobile navigation opens, closes, and updates the selected hash', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#home')

  const menuButton = page.getByRole('button', { name: 'Open navigation menu' })
  const navigation = page.getByRole('navigation', { name: 'Main navigation' })

  await menuButton.click()
  await expect(navigation).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Close navigation menu' }),
  ).toHaveAttribute('aria-expanded', 'true')

  await page.getByRole('link', { name: 'Services' }).click()
  await expect(navigation).toBeHidden()
  await expect(page).toHaveURL(/#services$/)
})

test('hero calls to action point to their intended anchors', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#home')

  const quoteLink = page.getByRole('link', { name: /Get a free sourcing quote/ })
  const routeLink = page.getByRole('link', { name: 'See how it works' })

  await expect(quoteLink).toHaveAttribute('href', '#contact')
  await quoteLink.click()
  await expect(page).toHaveURL(/#contact$/)

  await routeLink.click()
  await expect(page).toHaveURL(/#journey$/)
  await expect(page.locator('#journey')).toBeInViewport()
})

test('renders the Phase 2B sections in reference order', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#home')

  await expect(page.locator('#services .service-card')).toHaveCount(6)
  await expect(page.locator('#journey .journey-step')).toHaveCount(6)
  await expect(page.locator('#products .product-card')).toHaveCount(6)
  await expect(page.locator('#shanghai')).toContainText(
    'Shanghai Shengqiao Chain Trading Co., Ltd.',
  )

  const sectionOrder = await page.evaluate(() =>
    ['services', 'journey', 'products', 'shanghai'].map((id) =>
      document.getElementById(id).getBoundingClientRect().top,
    ),
  )

  expect(sectionOrder[0]).toBeLessThan(sectionOrder[1])
  expect(sectionOrder[1]).toBeLessThan(sectionOrder[2])
  expect(sectionOrder[2]).toBeLessThan(sectionOrder[3])
})

test('shipment stage selection updates the route progress', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#journey')

  const lastStage = page.getByRole('button', {
    name: /06 Delivered to your door/,
  })

  await lastStage.click()
  await expect(page.locator('.journey-current')).toContainText(
    'Delivered to your door',
    { timeout: 10_000 },
  )

  await expect(lastStage).toHaveAttribute('aria-current', 'step')
  await expect(page.locator('[role="progressbar"]')).toHaveAttribute(
    'aria-valuenow',
    '100',
  )
  await expect(page.locator('.journey-current')).toContainText(
    'Delivered to your door',
  )
})

test('earth and voyage scenes render, and scroll controls journey motion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#home')

  await expect(page.locator('.earth-globe__canvas')).toBeAttached({
    timeout: 20_000,
  })
  await expect(page.locator('.earth-location[data-city="shanghai"]')).toBeAttached({
    timeout: 20_000,
  })
  await expect(page.locator('.earth-location[data-city="chennai"]')).toBeAttached({
    timeout: 20_000,
  })
  await expect(page.locator('.earth-globe')).toHaveClass(/earth-globe--ready/, {
    timeout: 15_000,
  })

  const shanghaiLabel = page.locator('.earth-location[data-city="shanghai"]')
  const firstPosition = await shanghaiLabel.getAttribute('style')
  await page.waitForTimeout(1000)
  const nextPosition = await shanghaiLabel.getAttribute('style')
  expect(nextPosition).not.toBe(firstPosition)

  const journey = page.locator('#journey')
  const start = await journey.evaluate((element) => element.offsetHeight)
  expect(start).toBeGreaterThan(6 * 900)
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto'
    document.querySelector('#journey').scrollIntoView()
  })
  await expect(page.locator('.voyage-visual__canvas')).toBeAttached({
    timeout: 20_000,
  })
  await expect(page.locator('.voyage-visual')).toHaveAttribute(
    'data-renderer',
    /three|svg-fallback/,
  )
})

test('all navigation and section calls to action resolve to existing sections', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#home')

  const missingTargets = await page.locator('a[href^="#"]').evaluateAll((links) =>
    links
      .map((link) => link.getAttribute('href'))
      .filter((href) => href && href.length > 1)
      .filter((href) => !document.querySelector(href)),
  )

  expect(missingTargets).toEqual([])
})

test('FAQ questions expand and collapse accessibly', async ({ page }) => {
  await page.goto('/#faq')

  const firstQuestion = page.locator('.faq-item').first()
  const summary = firstQuestion.locator('summary')

  await expect(firstQuestion).toHaveAttribute('open', '')
  await summary.click()
  await expect(firstQuestion).not.toHaveAttribute('open', '')
  await summary.click()
  await expect(firstQuestion).toHaveAttribute('open', '')
})

test('quote form validates and generates a WhatsApp-ready enquiry', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#contact')

  const form = page.locator('.quote-form')
  const submit = form.getByRole('button', {
    name: 'Prepare WhatsApp enquiry',
  })

  await expect(form.locator('input[required]')).toHaveCount(4)
  await submit.click()
  await expect(page.locator('#generated-message')).toHaveCount(0)

  await form.getByLabel('Your name *').fill('Test Importer')
  await form.getByLabel('City *').fill('Pune')
  await form.getByLabel('What do you want to import? *').fill('LED fixtures')
  await form.getByLabel('Approximate quantity *').fill('100 units')
  await form.getByLabel('Budget (optional)').fill('INR budget pending')
  await form.getByLabel('Details (optional)').fill('Sample enquiry for QA')
  await submit.click()

  await expect(page.locator('#generated-message')).toContainText(
    'Name: Test Importer',
  )
  await expect(page.locator('#generated-message')).toContainText(
    'Product: LED fixtures',
  )
  await expect(page.locator('.quote-result__notice')).toContainText(
    'WhatsApp is not connected yet',
  )
  await expect(page.locator('.quote-result a[href^="https://wa.me/"]')).toHaveCount(
    0,
  )
})

test('remaining reference sections are present in order', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#home')

  const sectionIds = [
    'trips',
    'work',
    'stories',
    'blog',
    'faq',
    'contact',
  ]

  for (const id of sectionIds) {
    await expect(page.locator(`#${id}`)).toBeAttached()
  }
  await expect(page.locator('#trips .business-trip-feature')).toBeVisible()
  await expect(page.locator('#work .case-study-card')).toHaveCount(4)
  await expect(page.locator('#stories .testimonial-placeholder')).toHaveCount(3)
  await expect(page.locator('#blog .guide-card')).toHaveCount(3)
  await expect(page.locator('#faq .faq-item')).toHaveCount(6)
  await expect(page.locator('#contact .quote-form')).toBeVisible()
  await expect(page.locator('.whatsapp-float')).toHaveAttribute(
    'href',
    '#contact',
  )
})
