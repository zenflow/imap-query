var test = require('tape');
var _ = require('lodash');
var ImapQuery = require('../lib');
var config = require('./config');

test('retrieving all emails', function(t){
    t.plan(5);
    var imap_query = new ImapQuery(config, ['ALL']);
    imap_query.check().then(function(changes){
        t.ok(changes, 'have changes');
        t.ok(changes.new_messages, 'have new messages');
        t.ok(!changes.old_messages, 'have no old messages');
        t.deepEqual(imap_query.messages(), changes.new_messages, 'new messages equal to all messages');
        var count = _.keys(changes.new_messages).length;
        t.ok(count, 'have some ('+count+') messages');
    }).catch(function(error){
        t.fail(error);
    });
});