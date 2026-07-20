import { useRouter } from 'vue-router'

const STATE_PREFIX = '__detailNav_'

/**
 * 统一的用户详情页（userRecordDetail）导航工具
 * 导出函数，调用后返回一个包含多个导航方法的对象
 *
 * 职责：
 *   1. 从任意页面跳转到 userRecordDetail（自动保存来源页面状态）
 *   2. 从 userRecordDetail 返回来源页面（自动还原页面状态）
 * 
 * 
 * @returns {Object} 返回对象，包含以下函数：
 *   - navigateToDetail: 跳转到详情页 
 *   - navigateBack: 返回来源页
 *   - saveState: 保存状态 (不建议直接调用)
 *   - loadState: 读取状态 (不建议直接调用)
 *   - clearState: 清除状态 (不建议直接调用)
 */

export function useDetailNavigation() {
  const router = useRouter()

  // ======================== 内部工具 ========================

  /** 保存来源页面状态到 sessionStorage */
  function saveState(source, state) {
    if (state) {
      sessionStorage.setItem(`${STATE_PREFIX}${source}`, JSON.stringify(state))
    }
  }

  /** 读取来源页面状态 */
  function loadState(source) {
    const raw = sessionStorage.getItem(`${STATE_PREFIX}${source}`)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  /** 清除来源页面状态 */
  function clearState(source) {
    sessionStorage.removeItem(`${STATE_PREFIX}${source}`)
  }

  /**
   * 构建"跳转到详情页"的 query 参数
   * 统一从 row 中提取字段，避免各入口遗漏或写错字段名
   */
  function buildDetailQuery(row, source, tab) {
    return {
      userId: row.userId || '',
      meterCode: row.meterCode || '',
      companyId: row.companyId || '',
      source,
      ...(tab ? { tab } : {}),
    }
  }

  /**
   * 构建"返回来源页"的 query 参数
   * 不同来源页的还原参数格式不同，在此集中维护
   */
  function buildBackQuery(source, state) {
    const base = { restore: 'true' }

    if (source === 'userManage') {
      return {
        ...base,
        currentPage: state.currentPage,
        pageSize: state.pageSize,
        sortField: state.sortField,
        sortOrder: state.sortOrder,
        param: JSON.stringify(state.param),
        quyu_selected: state.quyu_selected ? JSON.stringify(state.quyu_selected) : null,
      }
    }

    if (source === 'warningManage') {
      return {
        ...base,
        paramsState: JSON.stringify(state.params),
        region: state.region || '',
        quyu_selected: state.quyu_selected ? JSON.stringify(state.quyu_selected) : null,
        filterText: state.filterText || '',
      }
    }

    // 未知来源：仅带 restore 标记返回
    return base
  }

  // ======================== 公开 API ========================

  /**
   * 跳转到 userRecordDetail
   *
   * @param {object}  row              - 行数据（至少含 userId, meterCode 等字段）
   * @param {object}  options
   * @param {string}  options.source     - 来源标识，如 'userManage' | 'warningManage'
   * @param {string}  [options.tab]      - 目标 tab，如 'bill' | 'meter' | 'transaction' | 'command'；省略则使用详情页默认 tab
   * @param {object}  [options.pageState] - 来源页当前状态（分页、搜索条件、区域选择等），用于返回时还原
   */
  function navigateToDetail(row, options = {}) {
    const { source = 'userManage', tab, pageState } = options

    saveState(source, pageState)

    router.push({
      path: '/userRecordDetail',
      query: buildDetailQuery(row, source, tab),
    })
  }

  /**
   * 从 userRecordDetail 返回来源页面，并还原之前保存的状态
   *
   * @param {string} source - 来源标识，与 navigateToDetail 时的 options.source 对应
   */
  function navigateBack(source) {
    const state = loadState(source)

    if (!state) {
      // 无保存状态（直接访问详情页等场景），简单跳回
      router.push({ path: `/${source}` })
      return
    }

    clearState(source)

    router.push({
      path: `/${source}`,
      query: buildBackQuery(source, state),
    })
  }

  return {
    navigateToDetail,
    navigateBack,
    // 以下方法暴露给可能需要单独操作状态的场景
    saveState,
    loadState,
    clearState,
  }
}
