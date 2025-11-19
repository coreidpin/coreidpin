import { test, expect } from '@playwright/test'

const URL = 'http://localhost:5173/get-started'

async function measure(selector: string, page: any) {
  const box = await page.locator(selector).boundingBox()
  if (!box) throw new Error(`No bounding box for ${selector}`)
  return { width: Math.round(box.width), height: Math.round(box.height) }
}

test.describe('Get Started card size stability', () => {
  for (const viewport of [
    { width: 1280, height: 800, label: 'desktop' },
    { width: 390, height: 844, label: 'mobile' },
  ]) {
    test(`size remains unchanged across toggle - ${viewport.label}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto(URL)

      const pinCardSel = '.card-fixed >> nth=0'
      const regCardSel = '.card-fixed >> nth=1'
      const triggerSel = '[data-slot="accordion-trigger"]'

      const pinBefore = await measure(pinCardSel, page)
      const regBefore = await measure(regCardSel, page)

      await page.click(triggerSel)
      const regAfterOpen = await measure(regCardSel, page)

      await page.click(triggerSel)
      const regAfterClose = await measure(regCardSel, page)

      expect(regBefore).toEqual(regAfterOpen)
      expect(regBefore).toEqual(regAfterClose)
      expect(pinBefore.width).toBeGreaterThan(0)
      expect(pinBefore.height).toBeGreaterThan(0)
    })
  }
})

