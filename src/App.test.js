import { render, screen } from '@testing-library/react'
import Mainpage from './components/mainpage/mainpage'

test('KeyNumerical', () => {
    render(<Mainpage />)
    expect(screen.getByText(/Numerical Method/i)).toBeInTheDocument()
})

test('KeyName', () => {
    render(<Mainpage />)
    expect(screen.getByText(/Sittichoke Changkid/i)).toBeInTheDocument()
})

// test('KeyStudentID', () => {
//     render(<Mainpage />)
//     expect(screen.getByText(/S6204062620047/i)).toBeInTheDocument()
// })