import { snakeCase, camelCase } from 'cosmokit';

import {
  trimCharStart,
  unescapeCQ,
  MapToString,
  OmitNullOrUndef,
} from './utils';

export type Segment<
  T extends string = string,
  D extends Record<string, any> = any
> = { type: T; data: D };

type DataOmTS<D extends Record<string, any>> = MapToString<OmitNullOrUndef<D>>;
type DataOm<D extends Record<string, any>> = OmitNullOrUndef<D>;

export function Segment<T extends string>(type: T): Segment<T>;
export function Segment<T extends string, D extends Record<string, any>>(
  type: T,
  data: D,
  toString?: true
): Segment<T, DataOmTS<D>>;
export function Segment<T extends string, D extends Record<string, any>>(
  type: T,
  data: D,
  toString: false
): Segment<T, DataOm<D>>;
export function Segment(
  type: string,
  data?: Record<string, any>,
  toString = true
) {
  if (data) {
    let entries = Object.entries(data).filter(
      ([, v]) => !(v === null || v === undefined)
    );
    if (toString)
      entries = entries.map(([k, v]) => {
        if (typeof v === 'boolean') v = v ? 1 : 0;
        return [snakeCase(k), `${v}`];
      });
    data = Object.fromEntries(entries);
  }
  return { type, data };
}

export type SegmentNumber<N extends number = number> = `${N}` | N;
export type SegmentBoolean =
  | SegmentNumber<0 | 1>
  | 'no'
  | 'yes'
  | `${boolean}`
  | boolean;
export type SegmentImageType = 'flash';
export type SegmentContactType = 'qq' | 'group';

export type SegmentExtra = Record<string, any>;
export type SegmentFileExtra = {
  cache?: SegmentBoolean;
  proxy?: SegmentBoolean;
  timeout?: SegmentNumber;
};
export type SegmentImageExtra = SegmentFileExtra & { type?: SegmentImageType };
export type SegmentRecordExtra = SegmentFileExtra & { magic?: SegmentBoolean };
export type SegmentShareExtra = { content?: string; image?: string };
export type SegmentLocationExtra = { title?: string; content?: string };
export type SegmentMusicExtra = { content?: string; image?: string };

export type SegmentText<E = {}> = Segment<'text', { text: string } & E>;
export type SegmentFace<E = {}> = Segment<'face', { face: SegmentNumber } & E>;
export type SegmentImageSend<E = {}> = Segment<
  'image',
  { file: string } & SegmentImageExtra & E
>;
export type SegmentImageRecv<E = {}> = Segment<
  'image',
  { url: string; file?: string; type?: SegmentImageType } & E
>;
export type SegmentRecordSend<E = {}> = Segment<
  'record',
  { file: string } & SegmentRecordExtra & E
>;
export type SegmentRecordRecv<E = {}> = Segment<
  'record',
  { url: string; file?: string; magic?: SegmentBoolean } & E
>;
export type SegmentVideoSend<E = {}> = Segment<
  'video',
  { file: string } & SegmentFileExtra & E
>;
export type SegmentVideoRecv<E = {}> = Segment<
  'video',
  { url: string; file?: string } & E
>;
export type SegmentAt<E = {}> = Segment<
  'at',
  { qq: SegmentNumber | 'all' } & E
>;
export type SegmentRps<E = {}> = Segment<'rps', {} & E>;
export type SegmentDice<E = {}> = Segment<'dice', {} & E>;
export type SegmentShake<E = {}> = Segment<'shake', {} & E>;
export type SegmentPoke<E = {}> = Segment<
  'poke',
  { type: SegmentNumber; id: SegmentNumber; name?: string } & E
>;
export type SegmentPokeSendGoCQ<E = {}> = Segment<
  'poke',
  { qq: SegmentNumber } & E
>;
export type SegmentAnonymousSend<E = {}> = Segment<
  'anonymous',
  { ignore: SegmentBoolean } & E
>;
export type SegmentShare<E = {}> = Segment<
  'share',
  { url: string; title: string } & SegmentShareExtra & E
>;
export type SegmentContact<E = {}> = Segment<
  'contact',
  { type: SegmentContactType; id: SegmentNumber } & E
>;
export type SegmentLocation<E = {}> = Segment<
  'location',
  { lat: SegmentNumber; lon: SegmentNumber } & SegmentLocationExtra & E
>;
export type SegmentMusicSend<E = {}> = Segment<
  'music',
  { type: string; id: string | number } & E
>;
export type SegmentMusicCustomSend<E = {}> = Segment<
  'music',
  {
    type: 'custom';
    url: string;
    audio: string;
    title: string;
  } & SegmentMusicExtra &
    E
>;
export type SegmentReply<E = {}> = Segment<'reply', { id: SegmentNumber } & E>;
export type SegmentForwardRecv<E = {}> = Segment<
  'forward',
  { id: SegmentNumber } & E
>;
export type SegmentNodeSend<E = {}> = Segment<
  'node',
  { id: SegmentNumber } & E
>;
export type SegmentNodeCustom<E = {}> = Segment<
  'node',
  { userId: string; nickname: string; content: string | Message } & E
>;
export type SegmentXml<E = {}> = Segment<'xml', { data: string } & E>;
export type SegmentJson<E = {}> = Segment<'json', { data: string } & E>;

export type SegmentTypeSend =
  | SegmentText
  | SegmentFace
  | SegmentImageSend
  | SegmentRecordSend
  | SegmentVideoSend
  | SegmentAt
  | SegmentRps
  | SegmentDice
  | SegmentShake
  | SegmentPoke
  | SegmentPokeSendGoCQ
  | SegmentAnonymousSend
  | SegmentShare
  | SegmentContact
  | SegmentLocation
  | SegmentMusicSend
  | SegmentMusicCustomSend
  | SegmentReply
  | SegmentNodeSend
  | SegmentNodeCustom
  | SegmentXml
  | SegmentJson;
export type SegmentTypeRecv =
  | SegmentText
  | SegmentFace
  | SegmentImageRecv
  | SegmentRecordRecv
  | SegmentVideoRecv
  | SegmentAt
  | SegmentRps
  | SegmentDice
  | SegmentShake
  | SegmentPoke
  | SegmentShare
  | SegmentContact
  | SegmentLocation
  | SegmentReply
  | SegmentForwardRecv
  | SegmentNodeSend
  | SegmentNodeCustom
  | SegmentXml
  | SegmentJson;
export type SegmentType = SegmentTypeSend | SegmentTypeRecv | Segment;
export type FilterSegment<
  S extends string,
  T extends SegmentType = SegmentType
> = T extends { type: S } ? T : never;

/* eslint-disable prefer-object-spread */
// for better type inference
// might looks like shit code...
Segment.text = <T extends string>(text: T) => Segment('text', { text });

Segment.face = <F extends SegmentNumber, E extends SegmentExtra = {}>(
  face: F,
  extra?: E
) => Segment('face', Object.assign({ face }, extra));

Segment.image = <F extends string, E extends SegmentImageExtra & SegmentExtra>(
  file: F,
  extra?: E
) => Segment('image', Object.assign({ file }, extra));

Segment.record = <
  F extends string,
  E extends SegmentRecordExtra & SegmentExtra
>(
  file: F,
  extra?: E
) => Segment('record', Object.assign({ file }, extra));

Segment.video = <F extends string, E extends SegmentFileExtra & SegmentExtra>(
  file: F,
  extra?: E
) => Segment('video', Object.assign({ file }, extra));

Segment.at = <Q extends SegmentNumber | 'all'>(qq: Q) => Segment('at', { qq });

Segment.atAll = () => Segment.at('all');

Segment.rps = <E extends SegmentExtra>(extra?: E) =>
  Segment('rps', Object.assign({}, extra));

Segment.dice = <E extends SegmentExtra>(extra?: E) =>
  Segment('dice', Object.assign({}, extra));

Segment.shake = <E extends SegmentExtra>(extra?: E) =>
  Segment('shake', Object.assign({}, extra));

Segment.poke = <
  T extends SegmentNumber,
  I extends SegmentNumber,
  E extends SegmentExtra
>(
  type: T,
  id: I,
  extra?: E
) => Segment('poke', Object.assign({ type, id }, extra));

Segment.pokeGoCQ = <Q extends SegmentNumber>(qq: Q) => Segment('poke', { qq });

Segment.anonymous = <B extends SegmentBoolean, E extends SegmentExtra>(
  ignore: B,
  extra?: E
) => Segment('anonymous', Object.assign({ ignore }, extra));

Segment.share = <
  U extends string,
  T extends string,
  E extends SegmentShareExtra & SegmentExtra
>(
  url: U,
  title: T,
  extra?: E
) => Segment('share', Object.assign({ url, title }, extra));

Segment.contact = <
  T extends SegmentContactType,
  I extends SegmentNumber,
  E extends SegmentExtra
>(
  type: T,
  id: I,
  extra?: E
) => Segment('contact', Object.assign({ type, id }, extra));

Segment.location = <
  LA extends SegmentNumber,
  LO extends SegmentNumber,
  E extends SegmentLocationExtra & SegmentExtra
>(
  lat: LA,
  lon: LO,
  extra?: E
) => Segment('location', Object.assign({ lat, lon }, extra));

Segment.music = <
  T extends string,
  I extends string | number,
  E extends SegmentExtra
>(
  type: T,
  id: I,
  extra?: E
) => Segment('music', Object.assign({ type, id }, extra));

Segment.musicCustom = <
  U extends string,
  A extends string,
  T extends string,
  E extends SegmentMusicExtra & SegmentExtra
>(
  url: U,
  audio: A,
  title: T,
  extra?: E
) =>
  Segment('music', Object.assign({ type: 'custom', url, audio, title }, extra));

Segment.reply = <I extends SegmentNumber, E extends SegmentExtra>(
  id: I,
  extra?: E
) => Segment('reply', Object.assign({ id }, extra));

Segment.node = <I extends SegmentNumber>(id: I) => Segment('node', { id });

Segment.nodeCustom = <
  U extends string | number,
  N extends string,
  C extends string | Message,
  E extends SegmentExtra
>(
  userId: U,
  nickname: N,
  content: C,
  extra?: E
) =>
  Segment(
    'node',
    Object.assign({ userId: `${userId}` as `${U}`, nickname, content }, extra),
    false
  );

Segment.xml = <D extends string>(data: D) => Segment('xml', { data });

Segment.json = <D extends string>(data: D) => Segment('json', { data });
/* eslint-enable prefer-object-spread */

Segment.resolveBool = (value: string) =>
  value === '1' || value === 'yes' || value === 'true';

export const h = Segment;
export type h<
  T extends string,
  D extends Record<string, string> = any
> /**/ = Segment<T, D>;

export type SendableMessage = (string | Segment)[] | string;
export type Message<MS extends Segment = Segment> = MS[];

export function Message(msg: SendableMessage): Message {
  if (Array.isArray(msg))
    return msg.map((v) => (typeof v === 'string' ? h.text(v) : v));

  // https://github.com/nonebot/adapter-onebot/blob/master/nonebot/adapters/onebot/v11/message.py#L301
  const cqRegex =
    /\[CQ:(?<type>[a-zA-Z0-9-_.]+)(?<params>(?:,[a-zA-Z0-9-_.]+=[^,\]]*)*),?\]/gu;

  const tmp: Message = [];
  let lastRightBracket = 0;
  for (;;) {
    const { lastIndex } = cqRegex;
    const result = cqRegex.exec(msg);
    if (!result) break;

    const raw = result[0];
    const { index } = result;
    const { type, params } = result.groups!;

    if (index > 0 && lastIndex !== index)
      tmp.push(h.text(msg.substring(lastIndex, index)));

    const data = Object.fromEntries(
      trimCharStart(params, ',')
        .split(',')
        .map((arr) => {
          const [k, v] = arr.split('=');
          return [camelCase(unescapeCQ(k)), v ? unescapeCQ(v) : ''];
        })
    );
    tmp.push(h(type, data));
    lastRightBracket = index + raw.length;
  }

  const tail = msg.substring(lastRightBracket);
  if (tail) tmp.push(h.text(tail));
  return tmp;
}

Message.build = (msg: SendableMessage) => Message(msg);
Message.toString = (msg: Message) =>
  msg
    .map((seg) => {
      if (seg.type === 'text') return seg.data.text;
      const params = Object.entries(seg.data)
        .map(([k, v]) => (v ? `,${k}=${v}` : `,${k}`))
        .join('');
      return `[CQ:${seg.type}${params}]`;
    })
    .join('');
Message.extractPlainText = (msg: Message) =>
  msg
    .filter((seg) => seg.type === 'text')
    .map((seg) => seg.data.text)
    .join('');
Message.extract = <T extends string>(type: T, msg: Message) =>
  msg.filter((seg) => seg.type === type) as FilterSegment<T>[];
