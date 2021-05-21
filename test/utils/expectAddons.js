const { expect } = require('chai');

const expectException = async function (promise, expectedError) {
  try {
    await promise;
  } catch (error) {
    if (error.message.indexOf(expectedError) === -1) {
      // When the exception was a revert, the resulting string will include only
      // the revert reason, otherwise it will be the type of exception (e.g. 'invalid opcode')
      const actualError = error.message.replace(
        /VM Exception while processing transaction: (revert )?/,
        '',
      );
      expect(actualError).to.equal(expectedError, 'Wrong kind of exception received');
    }
    return;
  }

  expect.fail('Expected an exception but none was received');
}

const expectRevert = async function (promise, expectedError) {
  promise.catch(() => { }); // Avoids uncaught promise rejections in case an input validation causes us to return early

  if (!expectedError) {
    throw Error('No revert reason specified: call expectRevert with the reason string, or use expectRevert.unspecified \
if your \'require\' statement doesn\'t have one.');
  }

  await expectException(promise, expectedError);
};

expectRevert.assertion = (promise) => expectException(promise, 'invalid opcode');
expectRevert.outOfGas = (promise) => expectException(promise, 'out of gas');
expectRevert.unspecified = (promise) => expectException(promise, 'revert');

const expectEvent = async function (promise, expectedEvent, expectedParams = {}) {
  promise.catch(() => { }); // Avoids uncaught promise rejections in case an input validation causes us to return early

  if (!expectedEvent) {
    throw Error('No event specified');
  }

  const receipt = await (await promise).wait()
  let = eventNamePresent = false
  for(let x in receipt.events){
    if(receipt.events[x].event == expectedEvent){
      eventNamePresent = true
      for(let y in expectedParams){
        expect(receipt.events[x].args, 'Emmited event "'+ expectedEvent +'" doesn\'t contain expected property "'+ y +'" with value "'+ expectedParams[y] +'"')
        .to.has.property(y)
        .that.is.eq(expectedParams[y])
      }
      break
    }
  }
  expect(eventNamePresent).to.equal(true, 'Transaction didn\'t emit "'+ expectedEvent +'" event')
}

const expectNoEvent = async function (promise, expectedEvent) {
  promise.catch(() => { }); // Avoids uncaught promise rejections in case an input validation causes us to return early

  if (!expectedEvent) {
    throw Error('No event specified');
  }

  const receipt = await (await promise).wait()
  let = eventNamePresent = false
  for(let x in receipt.events){
    if(receipt.events[x].event == expectedEvent){
      eventNamePresent = true
    }
  }
  expect(eventNamePresent).to.equal(false, 'Transaction emitted "'+ expectedEvent +'" event (but shouldn\'t)')
}

module.exports = {
  expectEvent,
  expectNoEvent,
  expectRevert
}

