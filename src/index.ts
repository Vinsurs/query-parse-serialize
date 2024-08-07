type QueryObject = {
  [key: string]: null | undefined | string | number | boolean | string[] | number[] | boolean[]
}
type QuerySerializeOptions = {
  /** Whether to ignore `null` or `undefined` and `empty string` value.
   * @default true
   */
  ignoreNullishValue?: boolean
  /** Whether to add a prefix(?) to the query string.
   * @default false
   */
  withPrefix?: boolean
  /** Whether to sort the keys in the query string. By default, the keys for querying strings are sorted alphabetically.
   * @default true
  */
  sorted?: boolean
  /** A function to custom value serialize behavior. By default the value will be handled with `String()` function, but you can custom it with this option. */
  stringify?: (val: any) => string
}
type QueryParseOptions = {
  /** Whether to ignore `empty string` value.
   * @default true
   * @example
   * const qs = parse("a=&b=2", { ignoreNoValue: true })
   * expect(qs).toEqual({ b: 2 })
   */
  ignoreNoValue?: boolean
  /** when `ignoreNoValue` option set to `false`, in this case Whether to treat it's value as empty string. 
   * @default false
   * @example
   * // when `ignoreNoValue` is `false` and `treatNoValueAsString` is `true`
   * const qs = parse("a=&b=&foo=foo", { ignoreNoValue: false, treatNoValueAsString: true })
   * expect(qs).toEqual({ a: "", b: "", foo: "foo" })
   * // when `ignoreNoValue` is `false` and `treatNoValueAsString` is `false`
   * const qs = parse("a=&b=&foo=foo", { ignoreNoValue: false, treatNoValueAsString: false })
   * expect(qs).toEqual({ foo: "foo" })
  */
  treatNoValueAsString?: boolean
  /** Whether to convert the stringified value to the corresponding type. 
   * if enabled, `'true'`, `'false'` will be converted to `'boolean'`, `'null'`, `'undefined'` 
   * will be converted to `null` and `undefined` and numberic value such as `'123'` will be converted to `number`.
   * @default true
  */
  typeConvert?: boolean
  /** A function to custom value parse behavior. */
  parse?: (val: string) => any
}
function isNullish(val: any): boolean {
  return val === null || val === void 0 || isEmptyString(val)
}
function isEmptyString(val: any): boolean {
  return String(val).trim().length === 0
}
/**
   * serialize a query object to a query string.
   * @param query query object to be serialized
   * @param options 
   * @example
   * ```ts
   * const qs = serialize({a: 1, b: 2})
   * expect(qs).toBe("a=1&b=2")
   * ```
   */
export function serialize(query: QueryObject, options?: QuerySerializeOptions): string {
  const { ignoreNullishValue, withPrefix, sorted, stringify } = Object.assign<QuerySerializeOptions, QuerySerializeOptions | undefined>({
    ignoreNullishValue: true,
    withPrefix: false,
    sorted: true,
    stringify: String
  }, options)
  const prefix = withPrefix ? "?" : ""
  if (!query) return prefix
  const keys = Object.keys(query)
  if (keys.length === 0) return prefix
  if (sorted) keys.sort()
  const qs = keys.reduce((prev, next) => {
    const val = query[next]
    if (ignoreNullishValue && isNullish(val)) return prev
    if (Array.isArray(val)) {
      return val.reduce((a: string, b) => `${a}${next}=${stringify!(b)}&`, prev)
    }
    return `${prev}${next}=${stringify!(val)}&`
  }, prefix).replace(/&$/, "")
  if (ignoreNullishValue) {
    return qs.split('&').filter(entry => {
      const [_, val] = entry.split('=')
      return val && val !== 'null' && val !== 'undefined'
    }).join('&')
  }
  return qs
}
/**
 * parse a query string to a query object.
 * @param querystring query string to be parsed
 * @param options 
 * @example
 * ```ts
 * const qs = parse("a=1&b=2")
 * expect(qs).toEqual({a: 1, b: 2})
 * ```
 */
export function parse(querystring: string, options?: QueryParseOptions): QueryObject {
  if (!querystring) return {}
  const { ignoreNoValue, treatNoValueAsString, typeConvert, parse } = Object.assign<QueryParseOptions, QueryParseOptions | undefined>({
    ignoreNoValue: true,
    treatNoValueAsString: false,
    typeConvert: true,
    parse(val) {
      return val
    },
  }, options)
  querystring = decodeURIComponent(querystring).replace(/^\?/, "")
  const recorder = {} as { [key: string]: string[] }
  querystring.split("&").forEach(entry => {
    const [key, val] = entry.split("=")
    if (!recorder[key]) {
      recorder[key] = []
    }
    recorder[key].push(val)
  })
  const result: QueryObject = {}
  Object.keys(recorder).forEach(key => {
    if (recorder[key].length > 1) {
      const vals = [] as any[]
      recorder[key].forEach(val => {
        val = transformValue(parse!(val))
        if (isEmptyString(val)) {
          if (!ignoreNoValue && treatNoValueAsString) {
            vals.push("")
          }
          return;
        }
        vals.push(val)
      })
      result[key] = vals
    } else {
      const val = transformValue(parse!(recorder[key][0]))
      if (isEmptyString(val)) {
        if (!ignoreNoValue) {
          result[key] = treatNoValueAsString ? "" : void 0;
        }
        return;
      }
      result[key] = val
    }
  })
  function transformValue(val: any) {
    if (typeConvert) {
      if (val === "true") return true
      if (val === "false") return false
      if (val === "null") return null
      if (val === "undefined") return undefined
      if (val === "0" || Number(val)) return Number(val)
    }
    return val
  }
  return result
}