import { v2 } from '../src/v2'

it('test token 1', () => {
    const token = v2('268761584121121501057537215301771044751053314520620437364173136510454342716753365');
    
    expect(token.computeCode('1234', new Date(Date.UTC(2020, 6, 28, 18, 5))).code).toBe('31478955');
    expect(token.computeCode('1234', new Date(Date.UTC(2020, 6, 13, 22, 42))).code).toBe('99423625');
    expect(token.computeCode('1234', new Date(Date.UTC(2020, 6, 14, 17, 15))).code).toBe('32554647');
    expect(token.computeCode('0000', new Date(Date.UTC(2020, 6, 14, 17, 15))).code).toBe('32553413');
    expect(token.computeCode('1234', new Date(Date.UTC(2020, 6, 14, 17, 16))).code).toBe('22721590');
    expect(token.computeCode('1235', new Date(Date.UTC(2020, 6, 14, 17, 16))).code).toBe('22721591');
    expect(token.computeCode('12345678', new Date(Date.UTC(2020, 6, 14, 17, 16))).code).toBe('34065934');
    expect(token.computeCode('1234', new Date(Date.UTC(2020, 6, 14, 17, 17))).code).toBe('25765781');
    expect(token.computeCode('1234', new Date(Date.UTC(2020, 6, 14, 17, 19))).code).toBe('67905799');
});

it('test token 1', () => {
    const token = v2('http://127.0.0.1/securid/ctf?ctfData=268761584121121501057537215301771044751053314520620437364173136510454342716753365');
    
    expect(token.computeCode('1234', new Date(Date.UTC(2020, 6, 28, 18, 5))).code).toBe('31478955');
    expect(token.computeCode('1234', new Date(Date.UTC(2020, 6, 13, 22, 42))).code).toBe('99423625');
    expect(token.computeCode('1234', new Date(Date.UTC(2020, 6, 14, 17, 15))).code).toBe('32554647');
    expect(token.computeCode('0000', new Date(Date.UTC(2020, 6, 14, 17, 15))).code).toBe('32553413');
    expect(token.computeCode('1234', new Date(Date.UTC(2020, 6, 14, 17, 16))).code).toBe('22721590');
    expect(token.computeCode('1235', new Date(Date.UTC(2020, 6, 14, 17, 16))).code).toBe('22721591');
    expect(token.computeCode('12345678', new Date(Date.UTC(2020, 6, 14, 17, 16))).code).toBe('34065934');
    expect(token.computeCode('1234', new Date(Date.UTC(2020, 6, 14, 17, 17))).code).toBe('25765781');
    expect(token.computeCode('1234', new Date(Date.UTC(2020, 6, 14, 17, 19))).code).toBe('67905799');
});

it('test token 2', () => {
    const token = v2('265718421982147620421361233751302667731732163701346667424173135550032152716723337');

    expect(token.computeCode('0000', new Date(Date.UTC(2020, 6, 28, 18, 9))).code).toBe('35507896');
    expect(token.computeCode('1234', new Date(Date.UTC(2020, 6, 28, 18, 9))).code).toBe('35508020');
    expect(token.computeCode('0000', new Date(Date.UTC(2020, 6, 28, 18, 10))).code).toBe('08611720');
    expect(token.computeCode('9999', new Date(Date.UTC(2020, 6, 28, 18, 10))).code).toBe('08610619');
});

it('test token 2 - android', () => {
    const token = v2('265718421982147620421361233751302667731732163701346667424173135550032156671614046');

    expect(token.computeCode('0000', new Date(Date.UTC(2020, 6, 28, 18, 9))).code).toBe('35507896');
    expect(token.computeCode('1234', new Date(Date.UTC(2020, 6, 28, 18, 9))).code).toBe('35508020');
    expect(token.computeCode('0000', new Date(Date.UTC(2020, 6, 28, 18, 10))).code).toBe('08611720');
    expect(token.computeCode('9999', new Date(Date.UTC(2020, 6, 28, 18, 10))).code).toBe('08610619');
});

it('test token 3', () => {
    const token = v2('205182420547406073217162237716772535444656056374636571404173135644226122716750274');

    expect(token.computeCode('0000', new Date(Date.UTC(2020, 6, 28, 18, 16))).code).toBe('29687245');
    expect(token.computeCode('1234', new Date(Date.UTC(2020, 6, 28, 18, 16))).code).toBe('29688479');
    expect(token.computeCode('0000', new Date(Date.UTC(2020, 6, 28, 18, 17))).code).toBe('10932411');
    expect(token.computeCode('9999', new Date(Date.UTC(2020, 6, 28, 18, 17))).code).toBe('10931300');
});

it('test token 3 - android', () => {
    const token = v2('205182420547406073217162237716772535444656056374636571404173135644226126671620603');

    expect(token.computeCode('0000', new Date(Date.UTC(2020, 6, 28, 18, 16))).code).toBe('29687245');
    expect(token.computeCode('1234', new Date(Date.UTC(2020, 6, 28, 18, 16))).code).toBe('29688479');
    expect(token.computeCode('0000', new Date(Date.UTC(2020, 6, 28, 18, 17))).code).toBe('10932411');
    expect(token.computeCode('9999', new Date(Date.UTC(2020, 6, 28, 18, 17))).code).toBe('10931300');
});