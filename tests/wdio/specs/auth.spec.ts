import { expect, browser, $ } from '@wdio/globals'

describe('Authentication Flow', () => {
    beforeEach(async () => {
        if (browser.isMobile) {
            // For mobile, we assume the app is already launched
            // and we might need to reset or navigate back
        } else {
            await browser.url('http://localhost:8084')
            await browser.pause(5000)
        }
    })

    it('should show the sign-in screen by default', async () => {
        const welcomeText = browser.isMobile
            ? await $('~Welcome back') // Accessibility ID for native
            : await $('body')

        if (browser.isMobile) {
            await expect(welcomeText).toBeDisplayed()
        } else {
            await expect(welcomeText).toHaveText(expect.stringContaining('Welcome back'))
        }
    })

    it('should allow switching between Mobile and Email tabs', async () => {
        const emailTab = browser.isMobile
            ? await $('~Email')
            : await $('div=Email')

        await emailTab.click()
        await browser.pause(1000)

        const emailLabel = browser.isMobile
            ? await $('~Email Address')
            : await $('div=Email Address')

        await expect(emailLabel).toBeDisplayed()
    })

    it('should show sign-up mode when clicking Sign Up', async () => {
        const signUpLink = browser.isMobile
            ? await $('~Sign Up')
            : await $('span=Sign Up')

        await signUpLink.click()
        await browser.pause(1000)

        const createAccountText = browser.isMobile
            ? await $('~Create account')
            : await $('div=Create account')

        await expect(createAccountText).toBeDisplayed()
    })
})
