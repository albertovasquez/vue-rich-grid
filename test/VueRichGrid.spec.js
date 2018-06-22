import { shallowMount } from '@vue/test-utils'
import VueRichGrid from '@/components/VueRichGrid.vue'

describe('VueRichGrid', () => {
    describe('handles empty params', () => {
        it('for baseParams', () => {
            expect(shallowMount(VueRichGrid, {}).isVueInstance()).toBe.true;
        })
    })
})