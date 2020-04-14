const x = new Map()

x.set('a', { b: 2, c: 3 })
x.set('b', { c: 3, d: 4 })

console.log(x)
const v = x.get('a')
v.b = 1

x.set('a', v)

console.log(x)
