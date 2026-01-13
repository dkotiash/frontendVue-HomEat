import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('should render the main navigation entries', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RouterView: { template: '<div />' },
        },
      },
    })

    expect(wrapper.text()).toContain('HomEat')
    expect(wrapper.text()).toContain('Home')
    expect(wrapper.text()).toContain('Einkaufsliste')
  })
})
