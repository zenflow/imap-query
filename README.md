# imap-query
Simple API for emitting emails, both existing at initialization and as they are received

[![dependencies](https://david-dm.org/zenflow/imap-query.svg)](https://david-dm.org/zenflow/imap-query)
[![dev-dependencies](https://david-dm.org/zenflow/imap-query/dev-status.svg)](https://david-dm.org/zenflow/imap-query#info=devDependencies)

[![npm](https://nodei.co/npm/imap-query.svg?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/imap-query)

### Todo
* readme writeup
* examples

### Changelog

#### v2.0.2
* Optimized streamToString

#### v2.0.1
* Fixed readme formatting

#### v2.0.0
* ImapQuery#check() now returns a Promise rather than taking a callback
* Now emits 'changes' event rather than multiple add/delete events

#### v1.0.1
* Some internal refactoring
* Added informal test
* Updated readme with warning
* Random bug fixes

#### v1.0.0
* First release