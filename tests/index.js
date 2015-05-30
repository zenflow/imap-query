var test = require('tape');
var ImapQuery = require('../lib');
var config = require('./config');

test('can retrieve all emails', function(t){
    t.plan(2);
    var imap_query = new ImapQuery(account, ['ALL']);
    imap_query.check().then(function(updated){
        t.ok(updated);
        t.ok(imap_query.messages().length)
    })
});