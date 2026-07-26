import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Map, MapMarker } from 'react-kakao-maps-sdk'
import { Button, LoadingScreen } from '../../components'
import { useCategories, useCreateStore, useMyStore, useUpdateStore } from '../../hooks'
import { useLocationStore } from '../../store'
import { isKakaoKeyConfigured, useKakaoMapLoader } from '../../lib/kakao'

type LatLng = { lat: number; lng: number }

const inputCls =
  'w-full rounded-card border border-line-strong bg-surface px-4 py-3 text-[15px] text-ink-900 placeholder:text-ink-300 focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30'

export function OwnerStorePage() {
  const { lat, lng } = useLocationStore()
  const { data: store, isLoading } = useMyStore()
  const { data: categories = [] } = useCategories()
  const create = useCreateStore()
  const update = useUpdateStore()

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [address, setAddress] = useState('')
  const [saved, setSaved] = useState(false)
  // 매장 좌표. 수정 모드는 DB 값으로 초기화하고, 신규는 기기 위치를 시작점으로 삼는다.
  const [coord, setCoord] = useState<LatLng>({ lat, lng })
  const [center, setCenter] = useState<LatLng>({ lat, lng })

  useEffect(() => {
    if (!store) return
    setName(store.name)
    setCategory(store.category_code)
    setAddress(store.address ?? '')
    setCoord({ lat: store.lat, lng: store.lng })
    setCenter({ lat: store.lat, lng: store.lng })
  }, [store])

  // 신규 등록 시 기본 카테고리를 실제 목록의 첫 항목으로(존재하지 않는 코드로 422 나는 것 방지).
  useEffect(() => {
    if (store || categories.length === 0) return
    setCategory((c) => (categories.some((x) => x.code === c) ? c : categories[0].code))
  }, [store, categories])

  if (isLoading) return <LoadingScreen />

  const save = () => {
    setSaved(false)
    const payload = {
      name,
      category_code: category,
      address: address || null,
      lat: coord.lat,
      lng: coord.lng,
    }
    if (store) {
      update.mutate({ id: store.id, payload }, { onSuccess: () => setSaved(true) })
    } else {
      // 등록 매장은 토큰의 점주 신원으로 서버가 귀속시킨다(1계정=1매장).
      create.mutate(payload, { onSuccess: () => setSaved(true) })
    }
  }

  const saving = create.isPending || update.isPending

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-extrabold text-ink-900">매장 관리</h1>
      <p className="mt-1 text-sm text-ink-500">
        {store ? '매장 정보를 수정할 수 있어요.' : '먼저 매장을 등록해 주세요.'}
      </p>

      <div className="mt-6 space-y-5 rounded-card-lg border border-line bg-surface p-6">
        <Field label="매장명">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: 행복베이커리"
            className={inputCls}
          />
        </Field>

        <Field label="카테고리">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
            {categories.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name_ko}
              </option>
            ))}
          </select>
        </Field>

        <Field label="주소">
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="예: 서울 중구 회현동1가 12-3"
            className={inputCls}
          />
        </Field>

        <div>
          <span className="mb-1.5 block text-[13px] font-semibold text-ink-700">매장 위치</span>
          <LocationPicker center={center} coord={coord} onChange={setCoord} />
        </div>

        {(create.isError || update.isError) && (
          <p className="text-sm text-danger">
            {((create.error ?? update.error) as Error)?.message ?? '저장에 실패했어요.'}
          </p>
        )}
        {saved && <p className="text-sm font-semibold text-primary">저장되었습니다.</p>}

        <Button
          fullWidth
          size="lg"
          className="rounded-[12px]"
          disabled={!name.trim()}
          loading={saving}
          onClick={save}
        >
          {store ? '매장 정보 저장' : '매장 등록'}
        </Button>
      </div>
    </div>
  )
}

function LocationPicker({
  center,
  coord,
  onChange,
}: {
  center: LatLng
  coord: LatLng
  onChange: (c: LatLng) => void
}) {
  const [loading, error] = useKakaoMapLoader()
  if (!isKakaoKeyConfigured || error) {
    return (
      <p className="text-[12px] text-ink-400">
        지도를 불러올 수 없어 현재 위치({coord.lat.toFixed(4)}, {coord.lng.toFixed(4)})로 저장돼요.
      </p>
    )
  }
  return (
    <div>
      <div className="h-52 w-full overflow-hidden rounded-card border border-line-strong">
        {loading ? (
          <div className="flex h-full items-center justify-center text-[13px] text-ink-400">
            지도 불러오는 중…
          </div>
        ) : (
          <Map
            center={center}
            level={3}
            style={{ width: '100%', height: '100%' }}
            onClick={(_map, mouseEvent) =>
              onChange({ lat: mouseEvent.latLng.getLat(), lng: mouseEvent.latLng.getLng() })
            }
          >
            <MapMarker
              position={coord}
              draggable
              onDragEnd={(marker) =>
                onChange({ lat: marker.getPosition().getLat(), lng: marker.getPosition().getLng() })
              }
            />
          </Map>
        )}
      </div>
      <p className="mt-1.5 text-[12px] text-ink-400">핀을 끌거나 지도를 눌러 매장 위치를 맞춰 주세요.</p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold text-ink-700">{label}</span>
      {children}
    </label>
  )
}
