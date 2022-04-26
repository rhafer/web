@public_link_share-feature-required
Feature: Edit public link shares
  As a user
  I want to edit public share
  So that I can manage the the shares

  Background:
    Given user "Alice" has been created with default attributes and without skeleton files in the server


  @issue-ocis-1328
  Scenario Outline: user tries to change the role of an existing public link role without entering share password while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the role to "<role>"
    Then the user should see an error message on the public link share dialog saying "Passwords are enforced for link shares"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions | role        | setting-name                                      |
      | read, create        | Viewer      | shareapi_enforce_links_password_read_only         |
      | read                | Contributor | shareapi_enforce_links_password_read_write        |
      | read                | Editor      | shareapi_enforce_links_password_read_write_delete |
      | read, create        | Uploader    | shareapi_enforce_links_password_write_only        |



  @issue-ocis-1328
  Scenario Outline: user tries to delete the password of an existing public link role while enforce password for that role is enforced
    Given the setting "<setting-name>" of app "core" has been set to "yes" in the server
    And user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder         |
      | name        | Public-link           |
      | permissions | <initial-permissions> |
      | password    | 123                   |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to ""
    Then the user should see an error message on the public link edit modal dialog saying "Password can't be empty"
    And user "Alice" should have a share with these details in the server:
      | field       | value                 |
      | share_type  | public_link           |
      | uid_owner   | Alice                 |
      | permissions | <initial-permissions> |
      | path        | /simple-folder        |
    Examples:
      | initial-permissions          | setting-name                                      |
      | read                         | shareapi_enforce_links_password_read_only         |
      | read, create                 | shareapi_enforce_links_password_read_write        |
      | read, update, create, delete | shareapi_enforce_links_password_read_write_delete |
      | create                       | shareapi_enforce_links_password_write_only        |


  Scenario: user edits a name of an already existing public link
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created file "simple-folder/lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder |
      | name        | Public-link   |
      | permissions | read          |
      | password    | pass123       |
    When the user renames the public link named "Public-link" of folder "simple-folder" to "simple-folder Share"
    And the public uses the webUI to access the last public link created by user "Alice" with password "pass123" in a new session
    Then file "lorem.txt" should be listed on the webUI


  Scenario: user edits the password of an already existing public link
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created file "simple-folder/lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder                |
      | name        | Public-link                  |
      | permissions | read, update, create, delete |
      | password    | pass123                      |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to "qwertyui"
    And the public uses the webUI to access the last public link created by user "Alice" with password "qwertyui" in a new session
    Then file "lorem.txt" should be listed on the webUI

  @issue-3830
  Scenario: user edits the password of an already existing public link and tries to access with old password
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has shared folder "simple-folder" with link with "read, update, create, delete" permissions and password "pass123" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder                |
      | name        | Public-link                  |
      | permissions | read, update, create, delete |
      | password    | pass123                      |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the password to "qwertyui"
    And the public uses the webUI to access the last public link created by user "Alice" with password "pass123" in a new session
    Then the public should not get access to the publicly shared file

  @issue-ocis-reva-292
  Scenario: user edits the permission of an already existing public link from read-write to read
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created file "simple-folder/lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder                |
      | name        | Public-link                  |
      | permissions | read, update, create, delete |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the role to "Viewer"
    And the public uses the webUI to access the last public link created by user "Alice" in a new session
    Then file "lorem.txt" should be listed on the webUI
    And it should not be possible to delete file "lorem.txt" using the webUI

  @issue-ocis-reva-292 @disablePreviews
  Scenario: user edits the permission of an already existing public link from read to read-write
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created folder "simple-folder/simple-empty-folder" in the server
    And user "Alice" has created file "simple-folder/lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder |
      | name        | Public-link   |
      | permissions | read          |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the role to "Editor"
    And the public uses the webUI to access the last public link created by user "Alice" in a new session
    And the user deletes the following elements using the webUI
      | name                |
      | simple-empty-folder |
      | lorem.txt           |
    Then the deleted elements should not be listed on the webUI
    And the deleted elements should not be listed on the webUI after a page reload

  @issue-ocis-reva-389
  Scenario: user removes the public link of a file using webUI
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has logged in using the webUI
    And user "Alice" has created a public link with following settings in the server
      | path        | lorem.txt   |
      | name        | Public-link |
      | permissions | read        |
    When the user removes the public link named "Public-link" of file "lorem.txt" using the webUI
    Then user "Alice" should not have any public link in the server


  Scenario: user edits the permission of an already existing public link from read-write to read-create
    Given user "Alice" has created folder "simple-folder" in the server
    And user "Alice" has created file "simple-folder/simple.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path        | simple-folder                |
      | name        | Public-link                  |
      | permissions | read, update, create, delete |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "simple-folder" changing the role to "Contributor"
    And the public uses the webUI to access the last public link created by user "Alice" in a new session
    And the user uploads file "lorem.txt" using the webUI
    Then file "simple.txt" should be listed on the webUI
    And file "lorem.txt" should be listed on the webUI


  Scenario: assign password to already created public share
    Given user "Alice" has created file "lorem.txt" in the server
    And user "Alice" has created a public link with following settings in the server
      | path | lorem.txt   |
      | name | Public-link |
    And user "Alice" has logged in using the webUI
    When the user tries to edit the public link named "Public-link" of folder "lorem.txt" adding a password "pass123"
    And the public uses the webUI to access the last public link created by user "Alice" with password "pass123" in a new session
    Then file "lorem.txt" should be listed on the webUI
