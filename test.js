const val = '*_free.*'.split(',').map(item => {
    let regStr = `^${item.trim().replace(/\./g, '\\.').replace(/\*/g, '.+')}$`
    return new RegExp(regStr).test('catolog_free1.json')
  })

  console.log(val)