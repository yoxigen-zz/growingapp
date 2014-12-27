angular.module("Config", []).constant("dbConfig", {
    objectStores: {
        entries: {
            name: "entries",
            version: 1,
            params: { keyPath: "timestamp" },
            indexes: [
                { name: 'type_idx', fields: ['playerId', 'type', 'date'], params: {unique: false} },
                { name: 'date_idx', fields: ['playerId', 'date'], params: {unique: false} },
                { name: 'age_idx', fields: ['age'], params: {unique: false} },
                { name: 'timestamp_idx', fields: 'timestamp', params: {unique: true} },
                { name: 'unsync_idx', fields: 'unsynced', params: {unique: false} }
            ]
        },
        files: {
            name: "files",
            version: 17,
            params: { keyPath: "id" },
            indexes: [
                { name: "id_idx", fields: "id", params: { unique: true }},
                { name: "mimetype_idx", fields: "mimeType", params: { unique: false }},
                { name: "unsync_idx", fields: "unsynced", params: { unique: false }},
                { name: "download_idx", fields: "requireDownload", params: { unique: false }}
            ]
        },
        players: {
            name: "players",
            version: 1,
            params: { keyPath: "playerId", autoIncrement: true },
            indexes: [
                { name: 'name_idx', fields: ['name'], params: {unique: true} },
                { name: 'gender_idx', fields: ['gender'], params: {unique: false} },
                { name: 'birthday_idx', fields: ['birthday'], params: {unique: false} },
                { name: 'unsync_idx', fields: 'unsynced', params: {unique: false} }
            ]
        }
    }
});
