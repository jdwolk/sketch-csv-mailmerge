import * as sketch from 'sketch'
import DOM from 'sketch/dom'
import * as R from 'ramda'
import dialog from '@skpm/dialog'
import CSV from 'papaparse'
const fs = require('@skpm/fs')

const CsvMailmerge = () => {
  const debug = (obj) => {
    console.log(JSON.stringify(obj))
  }

  const textsMatching = R.curry((str, texts) => {
    const matches = (s) => s.text === str
    return R.filter(matches, texts)
  })

  const isArtboard = (obj) => {
    return obj.type === 'Artboard'
  }

  const isText = (obj) => {
    return obj.type === 'Text'
  }

  const isSelected = (obj) => {
    return obj.selected
  }

  const artboardsFromPage = (page) => {
    return R.filter(isArtboard, page.layers)
  }

  const selectedArtboards = (page) => {
    return R.filter(isSelected, artboardsFromPage(page))
  }

  const textLayers = (obj) => {
    return R.filter(isText, obj.layers)
  }

  const extension = (path) => R.last(R.split('.', path))

  const applyToNewArtboard = (line, baseArtboard, index) => {
    const pixelsBetweenArtboards = 50
    const duplicated = baseArtboard.duplicate()
    const indexOffset = index + 1
    const widthOffset = (pixelsBetweenArtboards * indexOffset) + (baseArtboard.frame.width * indexOffset)
    const duplicatedText = textLayers(duplicated)

    const applyToMatchingTexts = R.curry((fn, key, val) => {
      const matchingTextLayers = textsMatching(`{${key}}`, duplicatedText)
      R.forEach((textLayer) => fn(textLayer, key, val), matchingTextLayers)
    })

    const substituteText = (textLayer, key, val) => {
      textLayer.text = val
    }

    const substituteImg = (textLayer, key, val) => {
      const parentArtboard = textLayer.getParentArtboard()
      const layerIndex = textLayer.index
      const oldLayer = textLayer.remove()
      const newLayer = new DOM.Image({
        image: val,
        frame: oldLayer.frame,
        transform: oldLayer.transform,
      })
      parentArtboard.layers.splice(layerIndex, 0, newLayer)
    }

    const applyTextVal = applyToMatchingTexts(substituteText)

    const applyImgVal = applyToMatchingTexts(substituteImg)

    const valIsImg = (val) => {
      const imgExtensions = ['png', 'jpg', 'jpeg']
      const theExtension = extension(val)
      const toReturn = R.includes(theExtension, imgExtensions)
      return toReturn
    }

    const applyVal = (val, key) => {
      console.log('Applying "' + val + '" to "{' + key + '}"')
      valIsImg(val)
        ? applyImgVal(key, val)
        : applyTextVal(key, val)
    }

    R.forEachObjIndexed(applyVal, line)
    duplicated.frame.x += widthOffset

    return duplicated
  }

  const promptForCsv = (cb) => {
    const csvFilePath = R.last(dialog.showOpenDialog({
      title: 'Choose CSV',
      properties: ['openFile'],
      filters: [
        { name: 'CSV', extensions: ['csv'] },
      ]
    }))

    if (!extension(csvFilePath) === '.csv') { return showExtensionError() }

    const csvFile = fs.readFileSync(csvFilePath, 'utf8')
    parseCsv(csvFile, (csv) => {
      cb(csv)
    })
  }

  const parseCsv = (path, cb) => {
    return CSV.parse(path, { header: true, complete: ({ data, errors }) => {
      return cb(data)
    }})
  }

  const showSelectionError = () => {
    sketch.UI.message('You must only select 1 layer')
  }

  const showExtensionError = () => {
    sketch.UI.message('Only CSVs are allowed')
  }

  const run = () => {
    const page = sketch.getSelectedDocument().selectedPage
    const artboards = selectedArtboards(page)

    if (artboards.length === 1) {
      const artboard = artboards[0]
      promptForCsv((rows) => {
        R.addIndex(R.forEach)((row, i) => {
          applyToNewArtboard(row, artboard, i)
        }, rows.slice(0, -1)) // last row is header so we want to ignore it
      })
    } else {
      showSelectionError()
    }
  }

  return {
    run,
  }
}

export default CsvMailmerge().run
