import { shallowMount } from '@vue/test-utils'
import VueRichGrid from '@/components/VueRichGrid.vue'

describe('VueRichGrid', () => {
    describe('handles empty props for', () => {
        it('options.baseParams', () => {
            expect(shallowMount(VueRichGrid, {}).isVueInstance()).toBe.true;
        })
    })

    describe('handles empty data', () => {
        it('has a nodata-text-block', () => {
            expect(shallowMount(VueRichGrid, {}).findAll('td.richgrid-nodata').length).toBe(1)
        })
        it('does not show paging', () => {
            expect(shallowMount(VueRichGrid, {}).findAll('.vue-rich-pager').length).toBe(0);
        })
    })
})