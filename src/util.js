function getNumItems() {
  const params = new URLSearchParams(window.location.search)
  if (params && params.get('items')) {
    const parsed = parseInt(params.get('items'), 10)
    if (isFinite(parsed)) {
      return parsed
    }
  }
  return 200
}

export const NUM_ITEMS = getNumItems()
