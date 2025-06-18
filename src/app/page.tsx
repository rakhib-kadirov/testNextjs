"use client"

import Image from "next/image";
import styles from "./page.module.css";
import Header from "./components/header";
import Reviews from "./components/Reviews/reviews";
import AddProduct from "./components/AddProduct";
import { getProducts } from '@/api/route'
import { useCallback, useEffect, useRef, useState } from "react";
import { Basket } from "./components/AddProduct/basket";

interface Product {
	page: number;
	amount: number;
	total: number;
	items: ProductItem[]
}

interface ProductItem {
	id: number;
	image_url: string;
	title: string;
	description: string;
	price: number;
}

export default function Home() {
	const [productState, setProductState] = useState<ProductItem[]>([])
	const [pageState, setPageState] = useState(1)
	const [totalState, setTotalState] = useState(0)
	const [isLoading, setIsLoading] = useState(false)

	const observer = useRef<IntersectionObserver>(null)
	const sentinelRef = useRef(null);

	const loadProducts = useCallback(async () => {
		if (isLoading || pageState * 6 > totalState) return

		setIsLoading(true)
		const newProducts = await getProducts(pageState, 6)
		setProductState(prev => [...prev, ...newProducts.items])
		setTotalState(newProducts.total)
		setIsLoading(false)
	}, [isLoading, pageState, totalState])

	useEffect(() => {
		const fetchData = async () => {
			const [dataProducts] = await Promise.all([getProducts(1, 6)])
			setProductState(dataProducts.items)
			setTotalState(dataProducts.total)
		}
		fetchData()
	}, [])

	useEffect(() => {
		const fetchProducts = async () => {
			await loadProducts()
		}
		fetchProducts()
	}, [pageState])

	useEffect(() => {
		const callback = (entries: any) => {
			if (entries[0].isInteresting && !isLoading) setPageState(prev => prev + 1)
		}

		observer.current = new IntersectionObserver(callback)
		const currentSentinel = sentinelRef.current
		if (currentSentinel) observer.current.observe(currentSentinel)

		return () => { if (currentSentinel) observer.current?.unobserve(currentSentinel) }
	}, [isLoading])

	return (
		<div className="flex min-h-screen flex-col items-center justify-start gap-32">
			<Header />
			<main className='w-[1442px] flex flex-col justify-center items-center'>
				<Reviews />
				<Basket />
				<div className='grid grid-cols-[1fr_1fr_1fr] gap-[20px] sm:grid-cols-3 mt-[100px]'>
					{productState.map(product => (
						<AddProduct key={product.id} product={product} />
					))}
				</div>
			</main>
		</div>
	);
}
