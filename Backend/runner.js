const { generarExcel, generarExcelVacio } = require('./src/api/exportacion-admin/services/test.js')();

const strapiMock = {
  log: { info: console.log },
  documents: () => ({
    findMany: async () => ([])
  })
};

(async () => {
  try {
    await generarExcelVacio(strapiMock);
    console.log("SUCCESS generarExcelVacio");
  } catch(e) {
    console.error("ERROR in generarExcelVacio", e);
  }
})();
