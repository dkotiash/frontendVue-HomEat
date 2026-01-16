import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, type Ref } from 'vue'
import RezepteHinzufuegenView from '@/views/RezepteHinzufuegenView.vue' // <-- Перевір, чи шлях до файла правильний!
import type { Recipe } from '@/types'

type AuthState = {
  user: Ref<{ sub: string; name?: string } | null>
  isAuthenticated: Ref<boolean>
}

let authState: AuthState

vi.mock('@auth0/auth0-vue', () => ({
  useAuth0: () => authState,
}))

function recipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: 1,
    title: 'Suppe',
    description: 'Leckere Suppe',
    ingredients: [{ name: 'Salz', quantity: '1 TL' }],
    ownerId: 'user-1',
    likes: 0,
    ...overrides,
  }
}

function findButtonByText(wrapper: ReturnType<typeof mount>, text: string) {
  const match = wrapper.findAll('button').find(btn => btn.text().includes(text))
  return match
}

beforeEach(() => {
  authState = {
    user: ref({ sub: 'user-1', name: 'Test User' }),
    isAuthenticated: ref(true),
  }

  vi.stubGlobal('alert', vi.fn())

  vi.stubGlobal('scrollTo', vi.fn())
  vi.stubGlobal('confirm', vi.fn(() => true))
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ ok: true, json: async () => [] })),
  )
  localStorage.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

describe('RezepteHinzufuegenView', () => {
  it('should add an ingredient row when the plus button is clicked', async () => {
    const wrapper = mount(RezepteHinzufuegenView)
    const initial = wrapper.findAll('input[placeholder="Name"]').length
    await wrapper.findAll('button').find(b => b.text().includes('+'))?.trigger('click')
    const updated = wrapper.findAll('input[placeholder="Name"]').length
    expect(updated).toBe(initial + 1)
  })

  it('should render only recipes that belong to the current user', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => [
        recipe({ id: 1, ownerId: 'user-1', title: 'Mein Rezept' }),
        recipe({ id: 2, ownerId: 'other', title: 'Fremdes Rezept' }),
      ],
    }))
    vi.stubGlobal('fetch', fetchMock)
    const wrapper = mount(RezepteHinzufuegenView)
    await flushPromises()
    expect(wrapper.text()).toContain('Mein Rezept')
    expect(wrapper.text()).not.toContain('Fremdes Rezept')
  })

  it('should save a new recipe and reset the form', async () => {
    const fetchMock = vi.fn(async (_input, init) => {
      if (init?.method === 'POST') {
        return { ok: true, json: async () => recipe({ id: 10, title: 'Neu' }) }
      }
      return { ok: true, json: async () => [recipe({ id: 10, title: 'Neu' })] }
    })
    vi.stubGlobal('fetch', fetchMock)
    const wrapper = mount(RezepteHinzufuegenView)

    await wrapper.find('input[placeholder="Name des Rezepts"]').setValue('Neu')
    await wrapper.find('textarea').setValue('Beschreibung')
    await wrapper.find('input[placeholder="Name"]').setValue('Mehl')

    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'POST')).toBe(true)

    const titleInput = wrapper.find('input[placeholder="Name des Rezepts"]').element as HTMLInputElement
    expect(titleInput.value).toBe('')
  })

  it('should expand a recipe and show edit actions', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => [recipe({ title: 'New Title', ownerId: 'user-1' })],
    }))
    vi.stubGlobal('fetch', fetchMock)
    const wrapper = mount(RezepteHinzufuegenView)
    await flushPromises()
    expect(wrapper.text()).not.toContain('Ändern')
    await findButtonByText(wrapper, 'Öffnen')?.trigger('click')
    expect(wrapper.text()).toContain('Ändern')
  })

  it('should show an error when loading recipes fails', async () => {
    const fetchMock = vi.fn(async () => ({ ok: false, status: 500 }))
    vi.stubGlobal('fetch', fetchMock)
    const wrapper = mount(RezepteHinzufuegenView)
    await flushPromises()
    expect(wrapper.text()).toContain('HTTP 500')
  })

  it('should show an error when saving a recipe fails', async () => {
    const fetchMock = vi.fn(async (_input, init) => {
      if (init?.method === 'POST') {
        return { ok: false, status: 500 }
      }
      return { ok: true, json: async () => [] }
    })
    vi.stubGlobal('fetch', fetchMock)
    const wrapper = mount(RezepteHinzufuegenView)

    await wrapper.find('input[placeholder="Name des Rezepts"]').setValue('Neu')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('Speichern fehlgeschlagen')
  })

  it('should not show favorites when the user is not authenticated', async () => {
    authState.isAuthenticated.value = false
    const wrapper = mount(RezepteHinzufuegenView)
    expect(wrapper.text()).not.toContain('Deine Favoriten')
  })

  it('should not add a comment when the reply is empty', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => [recipe({ id: 7, title: 'Kommentare' })],
    }))
    vi.stubGlobal('fetch', fetchMock)
    const wrapper = mount(RezepteHinzufuegenView)
    await flushPromises()
    await wrapper.find('button.btn-link').trigger('click')
    await findButtonByText(wrapper, 'Senden')?.trigger('click')
    expect(wrapper.text()).toContain('Noch keine Bewertungen vorhanden.')
  })

  it('should show empty state when no recipes belong to the user', async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => [recipe({ id: 3, ownerId: 'someone-else' })],
    }))
    vi.stubGlobal('fetch', fetchMock)
    const wrapper = mount(RezepteHinzufuegenView)
    await flushPromises()
    expect(wrapper.text()).toContain('Es sind noch keine Rezepte gespeichert.')
  })
})
