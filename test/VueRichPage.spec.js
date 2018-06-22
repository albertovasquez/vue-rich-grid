import { shallowMount } from '@vue/test-utils'
import VueRichPage from '@/components/VueRichPage.vue'

describe('VueRichGrid', () => {
    describe('Paging', () => {
        it('shows when more data is received than limit', () => {
            expect(shallowMount(VueRichPage, {}).classes().includes('hide-pager')).toBe.true
        })
    })
})