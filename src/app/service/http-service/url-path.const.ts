export const urlPathConsts = {

    // login
    login: '/api/token/',
    refresh: '/api/token/refresh/',
    create: '/trial_account/aimtrier/create/',

    // Items
    getItem: '/item/',

    // sava
    savaData: '/Designs/',
    drawCad: '/Design/drawLayout/',

    saveDesign: '/houselayout/save/',

    importData: '/Designs/?ordering=-modify_time',

    // render
    renderCreate: '/ifuwo/render/create/',
    renderRequest: '/ifuwo/render/list/',

    // Model
    categoryListRoot: '/CategoryListRoot/',
    modelCategory: '/GetItemsListByCategoryID/',
    modelDetail: '/items/',

    // user
    userInfo: '/account/profile/api/user_info/get/',
    changEmail: '/account/setting/change_email/',
    getValidCode: '/message/api/validate/code/',
    changePhone: '/account/setting/change_mobile/',
    bindPhone: '/account/api/bind/mobile/',
    unBindPhone: '/account/api/unbind/mobile/',
    unBindEmail: '/account/api/unbind/email/',
    avatarUpload: '/account/setting/avatar_upload/',
    addressData: '/location/region/all/',
    update: '/account/profile/api/user_info/update/',
    changePassword: '/account/setting/change_password/',
    
    // houselayout
    ownHouselayout: '/houselayout/own/',
    deleteHouselayout: '/houselayout/delete/',
    searchHouselayout: '/houselayout/search/',
    getAddress: '/region/all/',
    getDetailHouselayout: '/houselayout/detail/',
    saveHouselayout: '/houselayout/save_profile/'
}
