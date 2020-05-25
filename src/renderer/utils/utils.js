export const isNotNullORBlank = (...args) => {
  for (let i = 0; i < args.length; i++) {
    let argument = args[i]
    if (argument == null || argument === '' || argument === undefined) {
      return false
    }
  }
  return true
}

export function timeFix () {
  const time = new Date()
  const hour = time.getHours()
  return hour < 9 ? '早上好' : (hour < 12 ? '上午好' : (hour <= 13 ? '中午好' : (hour < 20 ? '下午好' : '晚上好')))
}

export const checkIsAdmin = (roles) => {
  if (roles) {
    for (let i = 0; i < roles.length; i++) {
      return roles[i].name === '超级管理员'
    }
  }
  return false
}
