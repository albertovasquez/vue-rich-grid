import { shallowMount } from '@vue/test-utils'
import VueRichGrid from '@/components/VueRichGrid.vue'

describe('VueRichGrid', () => {
  it('handles empty props for baseParams', () => {
    const msg = 'new message'
    const wrapper = shallowMount(VueRichGrid, {})
    // expect(true).toBe.true();
  })
})