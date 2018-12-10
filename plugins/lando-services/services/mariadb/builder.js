'use strict';

// Modules
const _ = require('lodash');
const path = require('path');

/*
 * Apache for all
 */
module.exports = {
  name: 'mariadb',
  config: {
    // Versions
    version: '10.2',
    supported: ['10.2', '10.1'],
    legacy: [],
    // Config
    confSrc: __dirname,
    creds: {
      database: 'mariadb',
      password: 'mariadb',
      user: 'mariadb',
    },
    port: '3306',
    defaultFiles: {
      config: path.join(__dirname, 'lando.cnf'),
    },
    remoteFiles: {
      config: '/opt/bitnami/mariadb/conf/my_custom.cnf',
    },
  },
  parent: '_database',
  builder: (parent, config) => class LandoMariaDb extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);

      // Build the default stuff here
      const mariadb = {
        image: `bitnami/mariadb:${options.version}`,
        command: '/entrypoint.sh /run.sh',
        environment: {
          ALLOW_EMPTY_PASSWORD: 'yes',
          // MARIADB_EXTRA_FLAGS for things like coallation?
          MARIADB_DATABASE: options.creds.database,
          MARIADB_PASSWORD: options.creds.password,
          MARIADB_USER: options.creds.user,
        },
        healthcheck: {
          test: 'mysql -uroot --silent --execute "SHOW DATABASES;"',
          interval: '2s',
          timeout: '10s',
          retries: 25,
        },
        volumes: [
          `${options.defaultFiles.config}:${options.remoteFiles.config}`,
          `data_${options.name}:/bitnami/mariadb`,
        ],
      };
      // Send it downstream
      super(id, options, {
        services: _.set({}, options.name, mariadb),
        volumes: _.set({}, `data_${options.name}`, {}),
      });
    };
  },
};
