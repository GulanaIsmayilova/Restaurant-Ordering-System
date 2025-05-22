package com.restaurant.qrmenu.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String ORDER_QUEUE = "order.queue";
    public static final String ORDER_EXCHANGE = "order.exchange";
    public static final String ORDER_ROUTING_KEY = "order.routing.key";
    public static final String ORDER_ROUTING_KEY_NEW = "order.new";
    public static final String ORDER_ROUTING_KEY_CANCELLED = "order.cancelled";
    public static final String ORDER_ROUTING_KEY_DELIVERED = "order.delivered";
    public static final String WAITER_QUEUE = "waiter.queue";
    public static final String WAITER_ROUTING_KEY = "waiter.notification";

    @Bean
    public Queue orderQueue() {
        return QueueBuilder.durable(ORDER_QUEUE).build();
    }

    @Bean
    public Queue waiterQueue() {
        return QueueBuilder.durable(WAITER_QUEUE).build();
    }

    @Bean
    public DirectExchange orderExchange() {
        return new DirectExchange(ORDER_EXCHANGE);
    }

    @Bean
    public Binding orderBinding() {
        return BindingBuilder
                .bind(orderQueue())
                .to(orderExchange())
                .with(ORDER_ROUTING_KEY_NEW);
    }

    @Bean
    public Binding waiterBinding() {
        return BindingBuilder
                .bind(waiterQueue())
                .to(orderExchange())
                .with(WAITER_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory factory) {
        RabbitTemplate template = new RabbitTemplate(factory);
        template.setMessageConverter(jsonConverter());
        return template;
    }
}
