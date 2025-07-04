import { render, screen } from '@testing-library/react'
import { user } from '../vitest.setup'
import App from './App'

beforeEach(() => {
  render(<App />)
})

describe('三目並べゲーム', () => {
  test('初期状態で"Next player: X"が表示されている', () => {
    expect(screen.getByText('Next player: X')).toBeInTheDocument()
  })

  test('9つのマス目が表示されている', () => {
    const squares = screen.getAllByRole('button', { name: '' })
    expect(squares).toHaveLength(9)
  })

  test('ゲーム履歴の"Go to game start"ボタンが表示されている', () => {
    expect(screen.getByRole('button', { name: 'Go to game start' })).toBeInTheDocument()
  })

  test('マス目をクリックするとXが配置される', async () => {
    const squares = screen.getAllByRole('button', { name: '' })
    await user.click(squares[0])
    
    expect(squares[0]).toHaveTextContent('X')
    expect(screen.getByText('Next player: O')).toBeInTheDocument()
  })

  test('XとOが交互に配置される', async () => {
    const squares = screen.getAllByRole('button', { name: '' })
    
    // Xのターン
    await user.click(squares[0])
    expect(squares[0]).toHaveTextContent('X')
    expect(screen.getByText('Next player: O')).toBeInTheDocument()
    
    // Oのターン
    await user.click(squares[1])
    expect(squares[1]).toHaveTextContent('O')
    expect(screen.getByText('Next player: X')).toBeInTheDocument()
  })

  test('既に配置されたマス目はクリックできない', async () => {
    const squares = screen.getAllByRole('button', { name: '' })
    
    // 最初にXを配置
    await user.click(squares[0])
    expect(squares[0]).toHaveTextContent('X')
    
    // 同じマス目を再度クリック
    await user.click(squares[0])
    expect(squares[0]).toHaveTextContent('X') // まだX
    expect(screen.getByText('Next player: O')).toBeInTheDocument() // Oのターンのまま
  })

  test('水平ラインで勝利判定が働く', async () => {
    const squares = screen.getAllByRole('button', { name: '' })
    
    // Xが上段で勝利するパターン: X-O-X-O-X
    await user.click(squares[0]) // X
    await user.click(squares[3]) // O
    await user.click(squares[1]) // X
    await user.click(squares[4]) // O
    await user.click(squares[2]) // X勝利
    
    expect(screen.getByText('Winner: X')).toBeInTheDocument()
  })

  test('垂直ラインで勝利判定が働く', async () => {
    const squares = screen.getAllByRole('button', { name: '' })
    
    // Xが左列で勝利するパターン
    await user.click(squares[0]) // X
    await user.click(squares[1]) // O
    await user.click(squares[3]) // X
    await user.click(squares[2]) // O
    await user.click(squares[6]) // X勝利
    
    expect(screen.getByText('Winner: X')).toBeInTheDocument()
  })

  test('対角ラインで勝利判定が働く', async () => {
    const squares = screen.getAllByRole('button', { name: '' })
    
    // Xが対角線で勝利するパターン
    await user.click(squares[0]) // X
    await user.click(squares[1]) // O
    await user.click(squares[4]) // X
    await user.click(squares[2]) // O
    await user.click(squares[8]) // X勝利
    
    expect(screen.getByText('Winner: X')).toBeInTheDocument()
  })

  test('勝者が決まった後はマス目をクリックできない', async () => {
    const squares = screen.getAllByRole('button', { name: '' })
    
    // Xを勝利させる
    await user.click(squares[0]) // X
    await user.click(squares[3]) // O
    await user.click(squares[1]) // X
    await user.click(squares[4]) // O
    await user.click(squares[2]) // X勝利
    
    expect(screen.getByText('Winner: X')).toBeInTheDocument()
    
    // 勝利後に空のマス目をクリックしても変化しない
    await user.click(squares[5])
    expect(squares[5]).toHaveTextContent('')
  })

  test('ゲーム履歴が正しく記録される', async () => {
    const squares = screen.getAllByRole('button', { name: '' })
    
    // 2手進める
    await user.click(squares[0]) // X
    await user.click(squares[1]) // O
    
    // 履歴ボタンが追加される
    expect(screen.getByRole('button', { name: 'Go to move #1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Go to move #2' })).toBeInTheDocument()
  })

  test('履歴ボタンで過去の状態に戻れる', async () => {
    const squares = screen.getAllByRole('button', { name: '' })
    
    // 2手進める
    await user.click(squares[0]) // X
    await user.click(squares[1]) // O
    
    // 1手目に戻る
    await user.click(screen.getByRole('button', { name: 'Go to move #1' }))
    
    expect(squares[0]).toHaveTextContent('X')
    expect(squares[1]).toHaveTextContent('') // 2手目が取り消される
    expect(screen.getByText('Next player: O')).toBeInTheDocument()
  })

  test('"Go to game start"で初期状態に戻る', async () => {
    const squares = screen.getAllByRole('button', { name: '' })
    
    // 何手か進める
    await user.click(squares[0]) // X
    await user.click(squares[1]) // O
    
    // ゲーム開始に戻る
    await user.click(screen.getByRole('button', { name: 'Go to game start' }))
    
    // 全てのマス目が空になる
    squares.forEach(square => {
      expect(square).toHaveTextContent('')
    })
    expect(screen.getByText('Next player: X')).toBeInTheDocument()
  })
})