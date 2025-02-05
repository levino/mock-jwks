jest.mock('nock', () => {
  const versions = {
    "11": "nock-11",
    "12": "nock-12",
    "13": "nock-13",
    "14": "nock",
  }
  const nockVersion = process.env.NOCK_VERSION || "14";
  const nock = jest.requireActual(versions[nockVersion]);
  return nock
})
