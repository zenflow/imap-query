# imap-query
Simple API for emitting emails, both existing at initialization and as they are received

[![dependencies](https://david-dm.org/zenflow/imap-query.svg)](https://david-dm.org/zenflow/imap-query)
[![dev-dependencies](https://david-dm.org/zenflow/imap-query/dev-status.svg)](https://david-dm.org/zenflow/imap-query#info=devDependencies)

[![npm](https://nodei.co/npm/imap-query.svg?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/imap-query)

__WARNING__

There is currently a bug (mscdex/node-imap#476) in node-imap where a message body stream for *some* emails 
will freeze in the middle, causing ImapQuery#check to never callback if it has to get any of those emails.

*For the time being it is suggested to test this module with a sample of the emails you will be watching for, before 
using it in your project.*

### Todo
* tape tests and travis ci
* readme writeup
* examples

### Changelog
#### v1.0.1
* Some internal refactoring
* Added informal test
* Updated readme with warning
* Added debug mode
#### v1.0.0
* First release