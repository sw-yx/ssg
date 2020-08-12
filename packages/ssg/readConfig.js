// just reads the user's ssg config
const path = require('path');
const fs = require('fs');
const coreData = require('./dist/coreData').default;
const debug = require('debug')('ssg:readConfig');

// todo: actually use opts.ssgConfig
const configPath = path.resolve(process.cwd(), 'ssg.config.js');

debug('reading config');
let ssgConfig;
try {
  ssgConfig = require(configPath);
} catch (err) {
  ssgConfig = {};
}
const dotFolderPath = path.join('__sapper__', 'ssg');
const dotFolderDataPath = path.join(dotFolderPath, 'data.json');

/** careful - this is relied on by [ssgData].json.js */
const getIndex = () => {
  return JSON.parse(fs.readFileSync(dotFolderDataPath, 'utf8'));
};

let getDataSlice = async (key, uid) => {
  const plugins = ssgConfig.plugins;
  const coreDataPlugin = coreData(ssgConfig.coreDataOpts);
  const allIndex = getIndex()
  coreDataPlugin.loadIndex(() => {
    return allIndex.ssgCoreData;
  });
  if (key === 'ssgCoreData') {
    // specialcase handling for ssgCoreData
    return coreDataPlugin.getDataSlice(uid);
  }
  if (plugins) {
    if (plugins[key]) {
      return plugins[key].getDataSlice(uid, coreDataPlugin, allIndex[key]);
    }
  }
  if (ssgConfig.getDataSlice) {
    return ssgConfig.getDataSlice(key, uid);
  }
  // fallback
  throw new Error('no data found for key: ' + key + ' uid: ' + uid);
};
module.exports = {
  getDataSlice,
  getIndex
};
