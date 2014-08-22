
## 1.1.0 (unreleased)

Features:

 - user's can now pass in their own template for use with the arrow. The orignal one is now just the default
 - same with the close button, user can pass in their own template

Bugfixes:

 - the "loading" class was being applied to the $popup, it should have been applied to $popupContainer
 - fix a bug with .popup('isShowing') returning false
 - jqXHR request are not properly aborting when you close the popup before the request finishes


## 1.0.0 (8/21/2014)

Initial Release