import { expect, describe, it } from "vitest"
import { parse, serialize } from "../src/index"

describe("parse", () => {
    it("should parse a valid simple query string", () => {
        const queryString = "foo=foo&bar=bar"
        const result = parse(queryString)
        expect(result).toEqual({ foo: "foo", bar: "bar" })
    })
    it("should parse a valid simple query string when there is no value", () => {
        const queryString = "foo=&bar=bar&baz="
        const result = parse(queryString)
        expect(result).toEqual({ bar: "bar" })
    })
    it("should parse a valid simple query string when there is no value with `ignoreNoValue` option", () => {
        const queryString = "foo=&bar=bar&baz="
        const result = parse(queryString, { ignoreNoValue: false, treatNoValueAsString: true })
        expect(result).toEqual({ foo: "", bar: "bar", baz: "" })
    })
    it("should parse a valid query string with multiple values for the same key", () => {
        const queryString = "foo=foo&bar=bar&bar=0"
        const result = parse(queryString, { typeConvert: true })
        expect(result).toEqual({ bar: ["bar", 0], foo: "foo" })
    })
    it("should be parsed correctly when the value in the query string contains a class value", () => {
        const queryString = "foo=1&bar=bar&bar=0"
        const result = parse(queryString, {
            parse: val => {
                if (Number(val)) {
                    return Number(val)
                }
                return val
            }
        })
        expect(result).toEqual({ bar: ["bar", 0], foo: 1 })
    })
})

describe("serialize", () => {
    it("should serialize a valid simple object", () => {
        const obj = { foo: "foo", bar: "bar" }
        const result = serialize(obj)
        expect(result).toBe("bar=bar&foo=foo")
    })
    it("should serialize a valid object with multiple values for the same key", () => {
        const obj = { foo: "foo", bar: ["bar", "1"] }
        const result = serialize(obj)
        expect(result).toBe("bar=bar&bar=1&foo=foo")
    })
    it("should serialize a valid simple object with 'withPrefix' option", () => {
        const obj = { foo: "foo", bar: "bar" }
        const result = serialize(obj, { withPrefix: true })
        expect(result).toBe("?bar=bar&foo=foo")
    })
    it("should ignore nullish value when serialize", () => {
        const obj = { foo: "foo", bar: null, baz: void 0 }
        const result = serialize(obj, { ignoreNullishValue: true })
        expect(result).toBe("foo=foo")
    })
    it("should ignore when value is not a string when serialize", () => {
        const obj = { foo: { name: "foo" }, bar: [["bar"], 1] }
        // @ts-ignore
        const result = serialize(obj, {
            ignoreNullishValue: true,
            stringify(val) {
                if (typeof val === "object") {
                    return ''
                }
                return String(val)
            },
        })
        expect(result).toBe("bar=1")
    })
})