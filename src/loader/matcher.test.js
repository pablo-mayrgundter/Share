import { describe, it, expect, mock } from 'bun:test'
import matcher from './matcher.js'


describe('matcher', () => {
  it('matches simple regex', () => {
    let cbCalled = 0
    let failCalled = 0
    const cb = mock(() => {
 cbCalled++
})
    const fail = mock(() => {
 failCalled++
})
    matcher('/share/v/p/index.ifc', /\/share\/v\/p\/([\w/]+)/)
      .then(cb)
      .or(fail)
    expect(cbCalled).toBe(1)
    expect(failCalled).toBe(0)
  })

  it('falls thru to second regex', () => {
    let cbCalled = 0
    let failCalled = 0
    const cb = mock(() => {
 cbCalled++
})
    const fail = mock(() => {
 failCalled++
})
    matcher('/share/v/gh/bldrs-ai/Share/main/blob/public/index.ifc', /\/share\/v\/p\/([\w/]+)/)
      .then(fail)
      .or(/\/share\/v\/gh\/(?<org>[\w-]+)\/(?<repo>\w+)\/(?<ref>\w+)\/blob\/(?<path>[\w/.]+)/)
      .then((match) => {
        const { org, repo, ref, path } = match.groups
        expect(org).toBe('bldrs-ai')
        expect(repo).toBe('Share')
        expect(ref).toBe('main')
        expect(path).toBe('public/index.ifc')
        cb()
      })
    expect(cbCalled).toBe(1)
    expect(failCalled).toBe(0)
  })


  it('matches full Momentum', () => {
    let cbCalled = 0
    let failCalled = 0
    const cb = mock(() => {
 cbCalled++
})
    const fail = mock(() => {
 failCalled++
})
    matcher('https://github.com/Swiss-Property-AG/Momentum-Public/blob/main/Momentum.ifc',
            /https?:\/\/github.com\/(?<org>[\w-]+)\/(?<repo>[\w-]+)\/blob\/(?<ref>[\w-]+)\/(?<path>[\w/.-]+)/)
      .then((match) => {
        const { org, repo, ref, path } = match.groups
        expect(org).toBe('Swiss-Property-AG')
        expect(repo).toBe('Momentum-Public')
        expect(ref).toBe('main')
        expect(path).toBe('Momentum.ifc')
        cb()
      })
      .or(fail)
    expect(cbCalled).toBe(1)
    expect(failCalled).toBe(0)
  })


  it('falls thru to final or', () => {
    let cbCalled = 0
    let failCalled = 0
    const cb = mock(() => {
 cbCalled++
})
    const fail = mock(() => {
 failCalled++
})
    matcher(
      'https://localhost:8090/models/bld/mix.bld',
      /dontmatch/)
      .then(fail)
      .or(cb)
    expect(cbCalled).toBe(1)
    expect(failCalled).toBe(0)
  })
})
