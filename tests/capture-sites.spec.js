import { expect, test } from '@playwright/test'

const sites = [
  { name: 'reference', url: 'https://importnow-concept.vercel.app/#home' },
  { name: 'local', url: '/#home' },
]

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
]

const sectionIds = [
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
]

for (const site of sites) {
  for (const viewport of viewports) {
    test(`captures ${site.name} home at ${viewport.name}`, async ({
      page,
    }) => {
      test.setTimeout(120_000)
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      })

      try {
        await page.goto(site.url, {
          waitUntil: 'domcontentloaded',
          timeout: 30_000,
        })
      } catch (error) {
        if (site.name === 'reference') {
          test.skip(true, `Reference site was unavailable: ${error.message}`)
        }
        throw error
      }

      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(2500)
      try {
        await expect(page.locator('#home')).toBeVisible({ timeout: 5000 })
      } catch (error) {
        if (site.name === 'reference') {
          test.skip(true, `Reference home did not load: ${error.message}`)
        }
        throw error
      }

      await page.screenshot({
        path: `test-results/captures/${site.name}-${viewport.name}-home.png`,
        animations: 'disabled',
        timeout: 60_000,
      })
    })
  }

  test(`captures ${site.name} section positions at desktop`, async ({ page }) => {
    test.setTimeout(120_000)
    await page.setViewportSize({ width: 1440, height: 900 })
    try {
      await page.goto(site.url, {
        waitUntil: 'domcontentloaded',
        timeout: 30_000,
      })
    } catch (error) {
      if (site.name === 'reference') {
        test.skip(true, `Reference site was unavailable: ${error.message}`)
      }
      throw error
    }

    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(2500)

    for (const sectionId of sectionIds) {
      const targetId = sectionId === 'blog' && site.name === 'reference'
        ? 'guides'
        : sectionId
      const section = page.locator(`#${targetId}`)
      try {
        await expect(section).toBeAttached({ timeout: 5000 })
      } catch (error) {
        if (site.name === 'reference') {
          test.skip(true, `Reference section #${targetId} did not load: ${error.message}`)
        }
        throw error
      }
      const targetTop = await section.evaluate((element) => {
        const sectionTop =
          element.getBoundingClientRect().top + window.scrollY
        return sectionTop + (element.id === 'journey' ? 120 : 70)
      })
      await page.evaluate((top) => window.scrollTo(0, top), targetTop)
      await page.evaluate(() => {
        document
          .querySelectorAll('.reveal-on-scroll')
          .forEach((element) => element.classList.add('is-visible'))
        document
          .querySelectorAll('.rv')
          .forEach((element) => element.classList.add('in'))
      })
      await page.waitForTimeout(300)
      await page.screenshot({
        path: `test-results/captures/${site.name}-desktop-${targetId}.png`,
        animations: 'disabled',
        timeout: 30_000,
      })
    }
  })
}
