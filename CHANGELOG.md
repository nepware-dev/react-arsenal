## [1.4.1](https://github.com/nepware-dev/react-arsenal/compare/v1.4.0...v1.4.1) (2026-09-04)


### Bug Fixes

* **popup:** keep focus in place when non-focusable popup content is pressed ([35cb2d5](https://github.com/nepware-dev/react-arsenal/commit/35cb2d5d29610c63b2af641f00680a83ceaca191))

# [1.4.0](https://github.com/nepware-dev/react-arsenal/compare/v1.3.0...v1.4.0) (2026-08-31)


### Bug Fixes

* **calendar:** keep the visible month valid across system switches ([ef14cae](https://github.com/nepware-dev/react-arsenal/commit/ef14cae7ca726af34338fe58ea46600cc29959c2))
* **datetime-picker:** stop popup reopening after a value is picked ([0475610](https://github.com/nepware-dev/react-arsenal/commit/04756103c3eba0992aa55289f2562d2f75803755))
* **select-input:** scroll to selected option without scrolling ancestors ([005160c](https://github.com/nepware-dev/react-arsenal/commit/005160c5c8741978a36efd1ad5a4babadb03e6ed))
* **styles:** inherit the app font on buttons ([fb084ab](https://github.com/nepware-dev/react-arsenal/commit/fb084aba2c1ee7e18eed51c6fc439b862f99bd8a))


### Features

* add time only picker input ([619b88f](https://github.com/nepware-dev/react-arsenal/commit/619b88ff1c6e87a499fcd538f789f7ee6e04a277))
* **draggable-list:** add drag and drop list component ([8ac19a9](https://github.com/nepware-dev/react-arsenal/commit/8ac19a9f718e4ab9f6c723da9977a09ce23b2bf9))

# [1.3.0](https://github.com/nepware-dev/react-arsenal/compare/v1.2.0...v1.3.0) (2026-08-14)


### Bug Fixes

* **calendar:** bound month dropdown options by min/max date ([4ec770c](https://github.com/nepware-dev/react-arsenal/commit/4ec770c414e4ceab56d6b66e05e4e856eab479e0))
* **calendar:** handle outside day click if not disabled ([e1c59be](https://github.com/nepware-dev/react-arsenal/commit/e1c59be859b4a3b67371a17553754b54d8c1aa4c))
* **datepicker:** convert visible window on AD/BS toggle ([94beaaf](https://github.com/nepware-dev/react-arsenal/commit/94beaafa3af223d4173815f5982cddfdc09fd926))
* **datetimepicker:** keep typed date when a time is entered ([a7f32d7](https://github.com/nepware-dev/react-arsenal/commit/a7f32d7a6fd56ead878df055ff1875bcbe80ca4e))
* **popup:** correctly identify containing block ancestor ([f8f84d4](https://github.com/nepware-dev/react-arsenal/commit/f8f84d4f543df906a136a78620424fd86d6dda63))
* **popup:** keep focus inside popups that open outside a modal ([02f9b27](https://github.com/nepware-dev/react-arsenal/commit/02f9b276762548afb70f284358323d5160cee36f))
* **popup:** keep nested popups open and restore picker focus on close ([ec544d9](https://github.com/nepware-dev/react-arsenal/commit/ec544d9728a733e9f1b860a76b41ec18f1180597))


### Features

* **calendar:** add opt-in week start, outside days, and styling props ([33e87dd](https://github.com/nepware-dev/react-arsenal/commit/33e87dd980475dea3aa8dfe017a03fe5ef972c0f))
* **popup:** update position dynamically based on viewport ([1ebb21e](https://github.com/nepware-dev/react-arsenal/commit/1ebb21e93ab43d3c5f8faa4522618bef2bd58c22))

# [1.2.0](https://github.com/nepware-dev/react-arsenal/compare/v1.1.0...v1.2.0) (2026-07-28)


### Features

* **table:** add opt-in column sorting ([778e47b](https://github.com/nepware-dev/react-arsenal/commit/778e47bab0f152e362e6072c26b1b741a9a83565))

# [1.1.0](https://github.com/nepware-dev/react-arsenal/compare/v1.0.0...v1.1.0) (2026-07-23)


### Bug Fixes

* **build:** ship plain css and expose used internals ([ab76561](https://github.com/nepware-dev/react-arsenal/commit/ab76561572376dbf3e2da3332d1995bf45c1eec8))


### Features

* **inputs:** add bikram sambat calendar and iso date/datetime pickers ([3ce3639](https://github.com/nepware-dev/react-arsenal/commit/3ce363948cc58b667df3d98a4d3b0590464155c2))

# 1.0.0 (2026-07-22)


### Bug Fixes

* **accordion:** enable active state control from parent ([a382aae](https://github.com/nepware-dev/react-arsenal/commit/a382aae6127e6610cddc9956349c06a001b719c3))
* **accordion:** update height when children change ([cb514ff](https://github.com/nepware-dev/react-arsenal/commit/cb514ffcc7ad6100473ec269c8da976cc1af3564))
* add default i18n context ([45990f9](https://github.com/nepware-dev/react-arsenal/commit/45990f9d044176837b1edd9946643c13c5899024))
* add modal props type export ([282834d](https://github.com/nepware-dev/react-arsenal/commit/282834de4a9b79d210e638b73b6d51d74e89c318))
* **dropdown:** close dropdown on label click when open ([25f13f6](https://github.com/nepware-dev/react-arsenal/commit/25f13f623eb929130e36f8b668b4a102637b8c5e))
* **fileinput:** improve validation error messages ([323b723](https://github.com/nepware-dev/react-arsenal/commit/323b723dc92b7cf2c89e90877a8abbc980c12dcd))
* **fileinput:** mime type validation in dragdrop fileinput change event ([acd9c92](https://github.com/nepware-dev/react-arsenal/commit/acd9c9208d7de83670e94d934238b2a8f3c870da))
* **fileinput:** use base 1000 for file size calculations ([39a6492](https://github.com/nepware-dev/react-arsenal/commit/39a6492eafec81d25cc047d775c02ec7bb2e3051))
* **form:** add defaultvalue support to advanced form ([e8d2c31](https://github.com/nepware-dev/react-arsenal/commit/e8d2c314a5b46fe568cc76d80289941bdd4200d1))
* **form:** on form change handler ([f1d6b7a](https://github.com/nepware-dev/react-arsenal/commit/f1d6b7aac6bc4e1c702e280a443752cbccf202d4))
* **form:** provide native form element in Form component ref ([b80d711](https://github.com/nepware-dev/react-arsenal/commit/b80d7117c66c7f6f9580d51f2af26ecaeb9aa4ec))
* **form:** reset form functionality ([9f6efe1](https://github.com/nepware-dev/react-arsenal/commit/9f6efe1c363d3b84e9e15eac8e5393f586dbe40e))
* **form:** use ref for fields to prevent unnecessary rerenders ([774b019](https://github.com/nepware-dev/react-arsenal/commit/774b019ef6e21eae5bf0eef16af4716fad1488a9))
* **hooks:** use promise hook error action issue ([dcb235b](https://github.com/nepware-dev/react-arsenal/commit/dcb235b395c3c02ac06020215c7149bce8134f3e))
* **hooks:** use toggle hook type definition ([8c7ec60](https://github.com/nepware-dev/react-arsenal/commit/8c7ec604fb804b40ab8adcb463ec4d8bc736721f))
* **i18n:** key translator function ([bf413ab](https://github.com/nepware-dev/react-arsenal/commit/bf413ab6fad75a4e0141746e6718e9c7062c6992))
* include columnIndex in hierarchical table column key ([060eb97](https://github.com/nepware-dev/react-arsenal/commit/060eb97569a7f19fff0f165f585110c3da049cd4))
* include input parameter type in use promise return type ([bef38d9](https://github.com/nepware-dev/react-arsenal/commit/bef38d93698ffac137f089ba8c335dc465bc60be))
* **inputs:** handle value prop in multiselect input ([734d5ff](https://github.com/nepware-dev/react-arsenal/commit/734d5fff581c5e027240ba38586ec0f54b2c5f0c))
* multi-select input circular dependency on useEffect ([184ab31](https://github.com/nepware-dev/react-arsenal/commit/184ab31dc2852d274ba12c88d4b3abf23fd55467))
* **multi-select:** unexpected scroll issues and close event ([1458108](https://github.com/nepware-dev/react-arsenal/commit/145810890856dea6be6bd77b7be47a9a3031e8c6))
* **options:** extract Item component to prevent remounts ([c6c8b79](https://github.com/nepware-dev/react-arsenal/commit/c6c8b79681ec540bcac8ca929fc77cc03124253d))
* **pagination:** controlled page number state ([ecd7262](https://github.com/nepware-dev/react-arsenal/commit/ecd726234f4a6eb1758b4f6593ce1be0edd842a4))
* prop name in table and tab scroll ([2791ca0](https://github.com/nepware-dev/react-arsenal/commit/2791ca0a1ff53a9460646827e83bdd10575c516d))
* **request:** don't resolve data for event stream response ([1d606af](https://github.com/nepware-dev/react-arsenal/commit/1d606af72644f8eca65202ca171bcd3b707e5623))
* return all options when search value is empty ([8db5f19](https://github.com/nepware-dev/react-arsenal/commit/8db5f19369e6cf386d3c8f4e712cfa29631a243e))
* **select-input:** compare keys instead of values when component updates ([bb884e4](https://github.com/nepware-dev/react-arsenal/commit/bb884e423ba17c4ced68ac428b95ccb34201f579))
* **select-input:** ignore programmatic focus returns ([8b5c69a](https://github.com/nepware-dev/react-arsenal/commit/8b5c69a29e64aa26bf71c3a7af546baa5b49f71d))
* **select-input:** options being filtered when onInputChange is passed ([4d42842](https://github.com/nepware-dev/react-arsenal/commit/4d428420d36a8b439e66ba08fa804561e9f10280))
* **select:** fire handleInputChange when closing popup ([ab0d382](https://github.com/nepware-dev/react-arsenal/commit/ab0d38299c8facfe13e9fe1fafff4f9d8d75e4ea)), closes [#33](https://github.com/nepware-dev/react-arsenal/issues/33)
* selectinput focus ([baab45c](https://github.com/nepware-dev/react-arsenal/commit/baab45c5ff0b009d7991aba04268b6336c3f390c))
* **select:** prevent focus when disabled and reset focused option state ([4b3aba4](https://github.com/nepware-dev/react-arsenal/commit/4b3aba4f14f40de303139c1b44463d6184c031d7))
* **table:** pass hierarchy path to table renderer ([190f64a](https://github.com/nepware-dev/react-arsenal/commit/190f64ac95a5bbb90a832bc35441f3131f20d923))
* **table:** preserve hierarchical table expansion state on row re-render ([66e7342](https://github.com/nepware-dev/react-arsenal/commit/66e734226618832b49d7a9b714b09bcd971705fe))
* **table:** prop name in hierarchical table ([b88d6c9](https://github.com/nepware-dev/react-arsenal/commit/b88d6c9f6624db0dd4138d981ab3049091cf8624))
* **tabs:** intersection observer for tabs in scroll mode ([cae5330](https://github.com/nepware-dev/react-arsenal/commit/cae5330fd6169a0c758aca7210bd873a8777f1ff))
* type issues in popup and tabs ([bcd40d3](https://github.com/nepware-dev/react-arsenal/commit/bcd40d32ca37f1c5871e1775c627cee1d12ef4b1))
* **types:** fix type issues ([4867392](https://github.com/nepware-dev/react-arsenal/commit/4867392821605427117d955a4df7601cfa794896))
* **typings:** return type in usepromise ([8469891](https://github.com/nepware-dev/react-arsenal/commit/84698911c42da06eac3531597c18f600b80be1b3))
* use clone response in request to support readable stream ([b42aa30](https://github.com/nepware-dev/react-arsenal/commit/b42aa3006103150d7240a93e8216ebbcf5cd9eee))


### Features

* add onOptionsEndReach props in select and multiselect input ([80f4ed2](https://github.com/nepware-dev/react-arsenal/commit/80f4ed228de4119405d659a9ea6677002fc725ba))
* center align dropdown ([980331f](https://github.com/nepware-dev/react-arsenal/commit/980331fd641eeeaa735be2abe3740c72608d3cdf))
* **checkbox:** support indeterminate checkbox ([9134243](https://github.com/nepware-dev/react-arsenal/commit/9134243ff68263cf004f0bcfba3ea38f3f013075))
* enhance list rendering logic with conditional loading behavior ([eceb3e7](https://github.com/nepware-dev/react-arsenal/commit/eceb3e7d6ad2170c4c30d5e37ec618fb01531157))
* **form:** add textarea input ([1039558](https://github.com/nepware-dev/react-arsenal/commit/1039558fb6aef7c37efacb1b9c86d638ba425dfc))
* **form:** added advanced form component that uses FormData api ([53f862f](https://github.com/nepware-dev/react-arsenal/commit/53f862f1745b7d1c96e2f81f67428075d544772d))
* **form:** handle form change event ([d69805e](https://github.com/nepware-dev/react-arsenal/commit/d69805ed01ef099f81d19d1834f95d69ad435b25))
* **i18n:** add dynamic localization support ([ea38818](https://github.com/nepware-dev/react-arsenal/commit/ea3881823be8bc5e0a9ce16c5c5bf73b7bed4c60))
* **input:** numeric input component ([cd811b6](https://github.com/nepware-dev/react-arsenal/commit/cd811b68377d7878b9b79577bb8e03ff44f61298))
* **inputs:** disabled options functionality in select and multiselect inputs ([41b937f](https://github.com/nepware-dev/react-arsenal/commit/41b937f8adc28ccf1f24d90231725c5fc8d4cd99))
* localize form input meta warning ([07f8d57](https://github.com/nepware-dev/react-arsenal/commit/07f8d57960978ff60777706bde776225437bc242))
* localize input meta warning ([17b04b4](https://github.com/nepware-dev/react-arsenal/commit/17b04b47e38fa4de39aedb1bc9591611b87cc8b9))
* npm release ([6821441](https://github.com/nepware-dev/react-arsenal/commit/68214414b6458952a2d59461d1ac991077c60cdf))
* onEndReachedThreshold props in select and multiselect input ([4c9e30c](https://github.com/nepware-dev/react-arsenal/commit/4c9e30ca28587c376a8db069268d3a44af1f99a8))
* **pagination:** add PageChangeCallback type ([cb8a73f](https://github.com/nepware-dev/react-arsenal/commit/cb8a73f6f3350d585d20812db69058b79f52839a))
* **popup:** add close on escape ([1fba5ac](https://github.com/nepware-dev/react-arsenal/commit/1fba5ac615f20ec3babaea1c7ea58e6caf0f2e49))
* **select-input:** add renderDisplayLabel props ([5f94bc5](https://github.com/nepware-dev/react-arsenal/commit/5f94bc54e02de28663479b800e4f7a1dea091f9f))
* **select-input:** add searchextractor prop for select inputs ([741a989](https://github.com/nepware-dev/react-arsenal/commit/741a989f962baf9889c686c2eae5597a344b52b3))
* **tab-header:** auto-scroll active tab into view ([28aad38](https://github.com/nepware-dev/react-arsenal/commit/28aad38b061e7d661c968d4854c583f9ad6dc6b8))
* **table:** add render table header callback ([96832c9](https://github.com/nepware-dev/react-arsenal/commit/96832c91af0782c3bf3f33ff906ec98c0ba857d2))
* **table:** add support for hierarchical table ([8926d0e](https://github.com/nepware-dev/react-arsenal/commit/8926d0e8838596b20b7d4a2a819e52ce8dcb25fc))
