import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../contexts/AuthContext'
import userEvent from '@testing-library/user-event'

// Basic render function for testing
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const setup = userEvent.setup()
  return {
    user: setup,
    ...render(ui, {
      wrapper: ({ children }) => (
        <MemoryRouter>
          <AuthProvider>
            {children}
          </AuthProvider>
        </MemoryRouter>
      ),
      ...options
    })
  }
}

// Re-export everything from Testing Library
export * from '@testing-library/react'
export { customRender as render }
export { userEvent }
